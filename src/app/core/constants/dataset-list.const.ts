import { FirestoreCollections } from '../interfaces';

export const datasetList = [
  {
    label: 'Categories',
    collection: FirestoreCollections.categories
  },
  {
    label: 'Materials',
    collection: FirestoreCollections.materials
  },
  {
    label: 'Collections',
    collection: FirestoreCollections.collections
  }
];
