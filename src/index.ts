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

const ids = eventBatch.map((event) => ({
  ...event,
  players: event.players.map((player, index) => ({
    ...player,
    id: `${player.team}-${index}-${event.frame.videoTimeMs}`
  }))
}));

const handler = new ConsoleCallbackHandler();

const model = new OpenAI({temperature: 0, modelName: 'gpt-3.5-turbo'});

const docs = eventBatch.map(
  (event: any) =>
    new Document({
      pageContent: eventMapper(event),
      metadata: {id: event.frame.videoTimeMs, videoTimeMs: event.frame.videoTimeMs, source: event.frame.videoTimeMs}
    })
);

const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

// Give me all players euclidean distances from the ball in the soccer field.
// What player or untracked player court coordinates are closest (in the soccer field) to the ball (don't consider ball position of other events)?

const prompt2 = `
The documents contain tracking information about football players and the ball position during different video times.
The size of the soccer field is 105x68. The coordinates of each player are the x=<x> and y=<y> properties of the player object. Sample player object is: '{team=HOME-1, x=96, y=38}'.

Note: if coordinates are negative, the ball/player are outside of the limits of the soccer field.

For following questions consider only frame with videoTimeMs 7126784.

With this information, can you tell me what is the ball position at video time?
How many players are in HOME team?
Tell me ball location (left, middle, right).

Calculate the euclidian distances of any players that you are able to to the ball at video time 7126784, show your work step by step and give the full ids of the players you are calculating.
`;

// Note: the closest player to the ball is the player with id 'AWAY-0-7126784'

const res = await chain.call({question: prompt2, chat_history: []}, [handler]);
console.log(res);
