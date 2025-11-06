from zemberek import TurkishMorphology, TurkishSentenceExtractor, TurkishSentenceNormalizer
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel

class SentenceRequest(BaseModel):
    sentence: str

class TurkishPOSTagger:
    def __init__(self):
        self.morphology = TurkishMorphology.create_with_defaults()
        self.sentence_extractor = TurkishSentenceExtractor()
        self.normalizer = TurkishSentenceNormalizer(self.morphology)

    def tag_sentence(self, sentence: str):
        # normalize the sentence first.
        normalized_sentence = self.normalizer.normalize(sentence) # lowercasing, removing punctuation, expanding contractions, standardizing whitespace, etc

        # get the morphological analyses for the entire sentence
        word_analyses = self.morphology.analyze_sentence(normalized_sentence) # morphological analysis: breaking into root and morphemes, 
        tagged_tokens = []
        # get most common (for now)
        most_common_usages = self.morphology.disambiguate(normalized_sentence, word_analyses)
        for word in most_common_usages.word_analyses:
            word_dict = {}
            for morpheme_data in word.best_analysis.morpheme_data_list:
                word_dict[f"{morpheme_data.surface}"] = morpheme_data.morpheme.name
            tagged_tokens.append(word_dict)
        return tagged_tokens

# create instance of tagger on start-up
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.tagger = TurkishPOSTagger()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:8080",
    "http://localhost:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/tag")
async def tag(sentence: SentenceRequest, request: Request):
    tagger: TurkishPOSTagger = request.app.state.tagger
    tagged = tagger.tag_sentence(sentence=sentence.sentence)
    return {"tokens": tagged}

# run using uvicorn pos_tagger:app --reload