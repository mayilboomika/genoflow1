import { Individual, Gender, Status } from './types';

export const NODE_WIDTH = 50;
export const NODE_HEIGHT = 50;

// This initial data recreates the classic pedigree structure from the user's reference image.
export const INITIAL_DATA: Individual[] = [
  // Generation I
  {
    id: 'p1',
    name: 'Mother',
    gender: Gender.Female,
    status: Status.Unaffected,
    isDeceased: false,
    isProband: false,
    x: 300,
    y: 100,
    parents: [],
    partners: ['p2'],
  },
  {
    id: 'p2',
    name: 'Father',
    gender: Gender.Male,
    status: Status.Unaffected,
    isDeceased: false,
    isProband: false,
    x: 410,
    y: 100,
    parents: [],
    partners: ['p1'],
  },
  // Generation II
  {
    id: 'p3',
    name: 'Son 1',
    gender: Gender.Male,
    status: Status.Unaffected,
    isDeceased: false,
    isProband: false,
    x: 230,
    y: 280,
    parents: ['p1', 'p2'],
    partners: [],
  },
  {
    id: 'p4',
    name: 'Son 2',
    gender: Gender.Male,
    status: Status.Unaffected,
    isDeceased: false,
    isProband: false,
    x: 355,
    y: 280,
    parents: ['p1', 'p2'],
    partners: [],
  },
  {
    id: 'p5',
    name: 'Daughter',
    gender: Gender.Female,
    status: Status.Unaffected,
    isDeceased: false,
    isProband: false,
    x: 480,
    y: 280,
    parents: ['p1', 'p2'],
    partners: [],
  },
];