import whisperx
import pandas as pd
import warnings
warnings.filterwarnings("ignore")
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

hf_token = "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"
groq_api_key = "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"

class AudioTranscription:
    def __init__(self, device="cuda", batch_size=16, compute_type="float16"):
        self.device = device
        self.batch_size = batch_size
        self.compute_type = compute_type
        try:
            self.model = whisperx.load_model("large", self.device, compute_type=self.compute_type)  # Use a smaller model
            self.diarize_model = whisperx.DiarizationPipeline(use_auth_token=hf_token, device=self.device)
        except Exception as e:
            print(f"Error loading models: {e}")
            raise

    def transcribe_audio(self, audio_file):
        try:
            audio = whisperx.load_audio(audio_file)
        except Exception as e:
            print(f"Error loading audio file: {e}")
            return None

        try:
            result = self.model.transcribe(audio, batch_size=self.batch_size)
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return None

        try:
            model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=self.device)
            result = whisperx.align(result["segments"], model_a, metadata, audio, self.device, return_char_alignments=False)
        except Exception as e:
            print(f"Error aligning audio: {e}")
            return None

        try:
            diarize_segments = self.diarize_model(audio)
            result = whisperx.assign_word_speakers(diarize_segments, result)
        except Exception as e:
            print(f"Error during diarization: {e}")
            return None

        return result

    def convert_to_df(self, result):
        if result is None:
            print("No result to save.")
            return None

        try:
            df = pd.DataFrame(result["segments"])
            df = df[["start", "end", "text", "speaker"]]
            return df
        except Exception as e:
            print(f"Error converting into DataFrame from segments: {e}")
            return None

class GroqAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.llm = ChatGroq(temperature=0.5, groq_api_key=self.api_key, model_name="Llama-3.1-70b-versatile")
        self.prompt_template = """
        You are an expert proof reader for Urdu transcription written for Pakistani talk shows. You identify
        and correct all grammatical and spelling errors that are present in the given transcription. Your task
        is to just correct the errors without changing any other details.
        Please review the given urdu transcription and correct all spelling and grammatical error.
        Do not change any other information in the transcription. Correct any Urdu spelling errors as per standard Urdu orthography.
        Please output only the corrected Urdu transcription text, with no English commentary or explanations. I only need the Urdu transcription as
        the final output. Dont tell me anything that you do, just give me the urdu transcription without any additional commentary.
        Here is the urdu transcription
        transcription : {transcription}

        """
        self.prompt = PromptTemplate(
            template=self.prompt_template,
            input_variables=["transcription"]
        )
        self.output_chain = self.prompt | self.llm | StrOutputParser()

    def improve_transcription(self, transcription):
        search_output = self.output_chain.invoke({"transcription": transcription})
        improved_transcription = search_output.strip()
        return improved_transcription

### Speaker Identification
class SpeakerNameMapper:
    def __init__(self, df):
        self.df = df
        self.names = ["speaker1", "speaker2", "speaker3"]

    def find_name_in_text(self, text):
        for name in self.names:
            if name.lower() in text.lower():
                return name
        return None

    def map_speakers(self):
        speaker_map = {}
        for index, row in self.df.iterrows():
            found_name = self.find_name_in_text(row['text'])
            if found_name:
                speaker_map[row['speaker']] = found_name
        self.df['speaker'] = self.df['speaker'].apply(lambda x: speaker_map.get(x, x))
        return self.df

def process_audio(audio_file_path):
    transcriber = AudioTranscription()
    result = transcriber.transcribe_audio(audio_file_path)
    df = transcriber.convert_to_df(result)
    if df is not None:
        # Save initial WhisperX transcription
        with open('whisperx_transcription.txt', 'w', encoding='utf-8') as f:
            for index, row in df.iterrows():
                f.write(f"Start: {row['start']}, End: {row['end']}, Text: {row['text']}, Speaker: {row['speaker']}\n")

        groq_api = GroqAPI(groq_api_key)
        df['text'] = df['text'].apply(groq_api.improve_transcription)

        # Save Groq LLM improved transcription
        with open('groq_transcription.txt', 'w', encoding='utf-8') as f:
            for index, row in df.iterrows():
                f.write(f"Start: {row['start']}, End: {row['end']}, Text: {row['text']}, Speaker: {row['speaker']}\n")

        mapper = SpeakerNameMapper(df)
        final_df = mapper.map_speakers()
        with open('generated_transcription.txt', 'w', encoding='utf-8') as f:
            for index, row in final_df.iterrows():
                f.write(f"Start: {row['start']}, End: {row['end']}, Text: {row['text']}, Speaker: {row['speaker']}\n")
        return final_df
    else:
        print("Transcription failed.")
        return None

if __name__ == "__main__":
    audio_file_path = "/content/samaa-talkshow.wav"
    final_df = process_audio(audio_file_path)
    if final_df is not None:
        print("Transcription with Speaker Diarization:")
        print(final_df)
        print("Transcription saved to 'generated_transcription.txt'")