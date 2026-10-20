import type { MapDef } from './types';
import * as ch1 from './maps/ch1';
import * as ch2 from './maps/ch2';
import * as ch3 from './maps/ch3';
import * as ch4 from './maps/ch4';
import * as ch5 from './maps/ch5';
import * as act2 from './maps/act2';
import * as ch6 from './maps/ch6';
import * as ch7 from './maps/ch7';
import * as ch8 from './maps/ch8';
import * as ch9 from './maps/ch9';
import * as ch10 from './maps/ch10';

export const MAPS: Record<string, MapDef> = { ...ch1, ...ch2, ...ch3, ...ch4, ...ch5, ...act2, ...ch6, ...ch7, ...ch8, ...ch9, ...ch10 };
