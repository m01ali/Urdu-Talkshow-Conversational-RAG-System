models = {
    "gpt-4-32k-azure": {
        "model_name": "gpt-4-32k-azure",
        "endpoint": "https://openai-fullframe-3.openai.azure.com/",
        "token_budget": 32768,
        "buffer": 100,
        "chunk_overlap": 5,
        "token_sizing_input": 6800,
        "token_sizing_output": 1390,
        "time_per_run": 15,
        "cost_per_1k": 0.004,
        "combine_sizing_input": 6800,
        "combine_sizing_output": 1390,
        "temperature": 0.0,
    },
    "gpt-4-1106-azure-3": {
        "model_name": "gpt-4-1106-Preview-Azure",
        "endpoint": "https://openai-fullframe-4.openai.azure.com/",
        "token_budget": 128000,
        "buffer": 5,
        "chunk_overlap": 5,
        "token_sizing_input": 128000,
        "token_sizing_output": 4096,
        "time_per_run": 1,
        "cost_per_1k": 0.1,
        "combine_sizing_input": 128000,
        "combine_sizing_output": 4096,
        "temperature": 0.0,
    },
    "CTranformers": {
        "model_name": "llama-2-13b-chat.ggmlv3.q4_K_S.bin",
    },
    "ollama": {
        "model_name": "mistral:latest",
    },
    "GROQ": {"model_name": "mixtral-8x7b-32768", "model_name2": "llama3-70b-8192"},
    "gpt-4o-azure": {
        "model_name": "gpt-4o-West-4",
        "endpoint": "https://openai-fullframe-4.openai.azure.com/",
        "token_budget": 8192,
        "buffer": 100,
        "chunk_overlap": 5,
        "token_sizing_input": 6800,
        "token_sizing_output": 1390,
        "time_per_run": 15,
        "cost_per_1k": 0.004,
        "combine_sizing_input": 6800,
        "combine_sizing_output": 1390,
        "temperature": 0.0,
    },
}


config_embeddings = {
    "text-embeddings-ada": {
        "model_name": "text-embedding-ada-002-azure-3",
        "endpoint": "https://OpenAI-Fullframe-3.openai.azure.com/",
    },
    "text-embedding-3-large": {
        "model_name": "text-embedding-3-large",
        "endpoint": "https://OpenAI-Fullframe-3.openai.azure.com/",
        "dimensions": 3072,
    },
    "Sentence-Transformer": {"model_name": "BAAI/bge-base-en-v1.5"},
}
