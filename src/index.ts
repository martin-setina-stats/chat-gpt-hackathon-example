import {OpenAI} from 'langchain/llms/openai';
import {Document} from 'langchain/document';
import {MemoryVectorStore} from 'langchain/vectorstores/memory';
import {OpenAIEmbeddings} from 'langchain/embeddings/openai';
import {ConversationalRetrievalQAChain} from 'langchain/chains';
import eventBatch from './sample_game/twoEvents.json' assert {type: 'json'};
// import eventBatch from './sample_game/256827_94122_2002_48.json' assert {type: 'json'};
import 'dotenv/config';

import {JSONLoader} from 'langchain/document_loaders/fs/json';
import {BaseCallbackHandler, ConsoleCallbackHandler} from 'langchain/callbacks';
import {AgentAction, AgentFinish, ChainValues} from 'langchain/schema';

const handler = new ConsoleCallbackHandler();

// const loader = new JSONLoader("src/sample_game/twoEvents.json");
// const docs1 = await loader.load();
// console.log(docs1);

const model = new OpenAI({temperature: 0, modelName: 'gpt-3.5-turbo'});

const docs = eventBatch.map(
  (event: any) =>
    new Document({
      pageContent: JSON.stringify(event),
      metadata: {id: event.frame.videoTimeMs, videoTimeMs: event.frame.videoTimeMs, source: event.frame.videoTimeMs}
    })
);
const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());
// const documents = await vectorStore.similaritySearch('"videoTimeMs":7126741');
// console.log(documents);
// process.exit(0);
const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

// Give me all players euclidean distances from the ball in the soccer field.
// What player or untracked player court coordinates are closest (in the soccer field) to the ball (don't consider ball position of other events)?

const prompt = `
The data contain tracking information about football players and the ball position during different video times.
JSON properties are:
- untracked[]: list of untracked players
- untracked[].team_id: team id
- untracked[].court: player coordinates in soccer field in euclidean space
- players[]: list of tracked players
- players[].team_id: team id
- players[].court: player coordinates in soccer field in euclidean space
- ball: ball position
- ball.court: ball coordinates in soccer field in euclidean space

With this information, can you tell me what is the ball position at video time 7126784?
How many players are in HOME team?
Tell me ball location (left, middle, right) in the court if court width is 105 and court height is 68.
`;

const prompt2 = `
The JSON data contains array of frames - tracking information about football players and the ball position during different video times.
JSON schema of the data is: 
{"$schema":"http://json-schema.org/draft-07/schema#","$id":"https://as-cv-control-service.com/common.json","title":"Common","description":"Soccer tracking frame, corresponds to the frame of the video of the soccer match","type":"object","properties":{"required":true,"game":{"type":"object","properties":{"courtSize":{"description":"Soccer court size","type":"object","properties":{"width":{"description":"Court size width","type":"number"},"height":{"description":"Court size height","type":"number"}}}}},"frame":{"description":"Soccer match video tracking frame info","type":"object","properties":{"videoTimeMs":{"description":"Video time in milliseconds","type":"number"}}},"players":{"description":"Soccer match players in the field - identified players","type":"array","items":{"type":"object","properties":{"team":{"description":"Player team","type":"string"},"court":{"description":"Player coordinates on the soccer court","type":"object","properties":{"x":{"description":"Player x coordinate on the soccer court","type":"number"},"y":{"description":"Player y coordinate on the soccer court","type":"number"}}}}}},"untracked":{"description":"Soccer match players in the field - not identified players","type":"array","items":{"type":"object","properties":{"team":{"description":"Player team","type":"string"},"court":{"description":"Player coordinates on the soccer court","type":"object","properties":{"x":{"description":"Player x coordinate on the soccer court","type":"number"},"y":{"description":"Player y coordinate on the soccer court","type":"number"}}}}}},"ball":{"description":"Soccer match ball","type":"object","properties":{"court":{"description":"Soccer ball coordinates on the soccer court","type":"object","properties":{"x":{"description":"Ball x coordinate on the soccer court","type":"number"},"y":{"description":"Ball y coordinate on the soccer court","type":"number"}}}}}}}


For following questions consider only frame with videoTimeMs 7126784.

With this information, can you tell me what is the ball position at video time?
How many players are in HOME team?
Tell me ball location (left, middle, right).
What is the closes player to the ball in the frame with video time?
`;

const res = await chain.call({question: prompt2, chat_history: []}, [handler]);
console.log(res);
