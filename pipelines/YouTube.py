import os
from pytubefix import YouTube
from pytubefix.cli import on_progress

# YouTube video URL
url = 'https://www.youtube.com/watch?v=8pQVPJuirM4&pp=ygUSbmV3cyB0YWxrc2hvdyB1cmR1'

# Create YouTube object with OAuth to bypass bot detection
yt = YouTube(url, on_progress_callback=on_progress, use_oauth=True, allow_oauth_cache=True)

# Function to get the best audio stream
def get_best_audio():
    max_audio = 0
    audio_itag = None
    for stream in yt.streams.filter(only_audio=True):
        abr = int(stream.abr.replace('kbps', ''))
        if abr > max_audio:
            max_audio = abr
            audio_itag = stream.itag
    return audio_itag

# Get the best audio stream
audio_itag = get_best_audio()

# Prompt the user to enter the desired file name
file_name = input("Enter the desired name for the audio file (without extension): ").strip()

# Ensure the file name is valid
if not file_name:
    file_name = "audio"

# Add file extension
file_name += ".mp4"

# Get the current working directory (D:\talkshow\pipelines in your case)
base_folder = os.getcwd()

# Create the Downloaded-audios folder inside D:\talkshow
download_folder = os.path.join(base_folder, "..", "Downloaded-audios")
os.makedirs(download_folder, exist_ok=True)

# Download audio only
if audio_itag:
    file_path = os.path.join(download_folder, file_name)
    yt.streams.get_by_itag(audio_itag).download(output_path=download_folder, filename=file_name)
    print(f"\u2705 Audio downloaded successfully! Saved at: {file_path}")
else:
    print("\u274C No audio stream found.")
