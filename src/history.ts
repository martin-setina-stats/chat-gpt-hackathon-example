import {OpenAI} from 'langchain/llms/openai';
import {Document} from 'langchain/document';
import {MemoryVectorStore} from 'langchain/vectorstores/memory';
import {OpenAIEmbeddings} from 'langchain/embeddings/openai';
import {ConversationalRetrievalQAChain} from 'langchain/chains';
// import eventBatch from './sample_game/256827_94122_2002_48.json' assert {type: 'json'};
import 'dotenv/config';
import {ConsoleCallbackHandler} from 'langchain/callbacks';
import {eventMapper} from './mappers.js';
import eventBatch from './sample_game/twoEvents.json' assert {type: 'json'};

const handler = new ConsoleCallbackHandler();

const model = new OpenAI({temperature: 0, modelName: 'gpt-3.5-turbo'});

// const docs = eventBatch.map(
//   (event: any) =>
//     new Document({
//       pageContent: eventMapper(event),
//       metadata: {id: event.frame.videoTimeMs, videoTimeMs: event.frame.videoTimeMs, source: event.frame.videoTimeMs}
//     })
// );
const docs = eventBatch.map((event) => eventMapper(event));
const vectorStore = await MemoryVectorStore.fromTexts(docs, [{id: 1}, {id: 2}], new OpenAIEmbeddings());
const documents = await vectorStore.similaritySearchWithScore(
  '[team=AWAY, x=96.39190673828125, y=27.673721313476562;,team=HOME, x=96.30827331542969, y=24.442710876464844;,team=AWAY, x=94.83358001708984, y=45.193641662597656;,team=HOME, x=97.23670196533203, y=36.72180938720703;,team=HOME, x=90.49993896484375, y=10.896432876586914;,team=HOME, x=88.19656372070312, y=32.67395782470703;,team=HOME, x=102.67534637451172, y=31.909866333007812;,team=AWAY, x=77.93115234375, y=26.19354248046875;,team=HOME, x=96.25846862792969, y=31.030742645263672;,team=AWAY, x=82.32412719726562, y=32.58012390136719;,team=HOME, x=96.12531280517578, y=38.754432678222656;,team=AWAY, x=96.53720092773438, y=33.42615509033203;,team=AWAY, x=82.24971771240234, y=26.922019958496094;,team=AWAY, x=97.15280151367188, y=35.10517120361328;,team=AWAY, x=94.01130676269531, y=17.69180679321289;]; [team=AWAY, x=94.22184753417969, y=34.470157623291016;,team=HOME, x=93.13704681396484, y=18.318645477294922;,team=AWAY, x=88.51220703125, y=7.625547409057617;,team=AWAY, x=96.89007568359375, y=34.429443359375;,team=HOME, x=98.67134094238281, y=31.582542419433594;,team=AWAY, x=94.22184753417969, y=34.470157623291016;,team=HOME, x=93.13704681396484, y=18.318645477294922;,team=AWAY, x=88.51220703125, y=7.625547409057617;,team=AWAY, x=96.89007568359375, y=34.429443359375;,team=HOME, x=98.67134094238281, y=31.582542419433594;], videoTimeMs: 7126784, source: 7126784',
  2
);
console.log(documents);
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

Note: if coordinates are negative, the ball/player are outside of the limits of the soccer field.
For following questions consider only frame with videoTimeMs 7126784.

With this information, can you tell me what is the ball position at video time?
How many players are in HOME team?
Tell me ball location (left, middle, right).
What is the closest player to the ball in the frame with video time?
`;

const res = await chain.call({question: prompt2, chat_history: []}, [handler]);
console.log(res);
