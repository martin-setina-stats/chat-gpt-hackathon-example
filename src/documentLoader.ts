import {S3Loader} from 'langchain/document_loaders/web/s3';

const loader = new S3Loader({
  bucket: 'as-tools-hackaton',
  key: 'test.json', // Note - the folder 887fp0ih4vl22bqcj23x73klw/ and its contents didn't have correct permissions, so uploaded a file myself
  unstructuredAPIURL: 'http://localhost:8000/general/v0/general'
});

const docs = await loader.load();

console.log('docs', docs);

export {docs};
