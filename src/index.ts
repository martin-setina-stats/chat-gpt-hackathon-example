import {OpenAI} from 'langchain/llms/openai';
import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import eventBatch from "./sample_game/256827_214292_2003_108.json" assert { type: "json" };
import 'dotenv/config';

const model = new OpenAI({ temperature: 0 });


const docs = eventBatch.map((event: any) => new Document({pageContent: JSON.stringify(event), metadata: {id: event.id}}))
const vectorStore = await MemoryVectorStore.fromDocuments(docs,
  new OpenAIEmbeddings()
);

const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );

const prompt = `
The data contain tracking information about football players and the ball position during different video times.
The data is formatted as a JSON array of objects, where each object represents a frame of the video.
The schema of the JSON formatted data is as follows (explanation of the fields is denoted by <...>):
    '{
    "game": {"courtSize": {"width": 105, "height": 68} < this is irrelevant > , "matchUuid": "887fp0ih4vl22bqcj23x73klw" < this is the unique identifier of the game being played >},
    "frame": {"time": 1683075443114, "dimensions": {"width": 1280, "height": 720}, "videoTimeMs": 8567787} <this object contains information about the frame of the video>,
    "untracked": [
      {
        "team": "HOME", <this denotes if the player is home or away player>
        "detBox": {"x": 71, "y": 427, "width": 40, "height": 97} <this denotes the bounding box of the player in the frame>,
        "court": {"x": 80.56748962402344, "y": 41.94643020629883} <this denotes the position of the player on the court>
      },
      {
        "team": "HOME",
        "detBox": {"x": 71, "y": 427, "width": 40, "height": 97},
        "court": {"x": 80.56748962402344, "y": 41.94643020629883}
      }
    ] <this array contains information about the players that are not being tracked - this can be referees or players not recognized by the model>,
    "players": [
      {
        "team": "AWAY",
        "detBox": {"x": 765, "y": 410, "width": 36, "height": 93},
        "court": {"x": 91.85224914550781, "y": 48.315528869628906}
      },
      {
        "team": "HOME",
        "detBox": {"x": 188, "y": 284, "width": 24, "height": 81},
        "court": {"x": 89.07418823242188, "y": 29.53516387939453}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 486, "y": 314, "width": 40, "height": 87},
        "court": {"x": 92.60234069824219, "y": 37.097015380859375}
      },
      {
        "team": "HOME",
        "detBox": {"x": 829, "y": 452, "width": 44, "height": 104},
        "court": {"x": 90.43148803710938, "y": 52.293025970458984}
      },
      {
        "team": "HOME",
        "detBox": {"x": 423, "y": 222, "width": 44, "height": 62},
        "court": {"x": 99.19569396972656, "y": 23.49370574951172}
      },
      {
        "team": "HOME",
        "detBox": {"x": 770, "y": 271, "width": 36, "height": 66},
        "court": {"x": 102.07180786132812, "y": 34.74564743041992}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 688, "y": 344, "width": 37, "height": 90},
        "court": {"x": 94.20809936523438, "y": 42.43925857543945}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 631, "y": 252, "width": 48, "height": 68},
        "court": {"x": 100.73653411865234, "y": 30.995702743530273}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 73, "y": 391, "width": 35, "height": 74},
        "court": {"x": 82.66041564941406, "y": 37.459346771240234}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 231, "y": 268, "width": 36, "height": 84},
        "court": {"x": 90.70669555664062, "y": 28.802074432373047}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 578, "y": 393, "width": 48, "height": 95},
        "court": {"x": 89.75092315673828, "y": 45.20396041870117}
      },
      {
        "team": "HOME",
        "detBox": {"x": 392, "y": 393, "width": 45, "height": 89},
        "court": {"x": 87.08218383789062, "y": 42.58446502685547}
      },
      {
        "team": "HOME",
        "detBox": {"x": 588, "y": 244, "width": 28, "height": 62},
        "court": {"x": 100.74645233154297, "y": 28.60201072692871}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 336, "y": 350, "width": 34, "height": 90},
        "court": {"x": 87.9835205078125, "y": 38.552433013916016}
      },
      {
        "team": "AWAY",
        "detBox": {"x": 535, "y": 298, "width": 36, "height": 74},
        "court": {"x": 95.16798400878906, "y": 34.999298095703125}
      },
      {
        "team": "HOME",
        "detBox": {"x": 688, "y": 450, "width": 52, "height": 99},
        "court": {"x": 88.74494934082031, "y": 50.397064208984375}
      }
    ] <this contains information about the players that are being tracked>,
    "ball": {
      "detBox": {"x": 680, "y": 298, "width": 19, "height": 20},
      "court": {"x": -13.1728515625, "y": -13.766101837158203}
    } <this contains information about the ball>
  }'

With this information, can you tell me what is the ball position at video time 8567829?
`

const res = await chain.call({ question: prompt, chat_history: [] });
console.log(res);

