import { PetalState } from './Petal';

export interface Connection {
  fromPetal: PetalState;
  toPetal: PetalState;
  isActive: boolean;
} 