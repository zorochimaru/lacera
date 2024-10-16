import { CommonFirestore } from '../firestore';
import { Material } from './material.interface';

export interface MaterialFirestore extends Material, CommonFirestore {}
