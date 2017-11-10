import { Token } from '@phosphor/coreutils';
import { IInstanceTracker } from '@jupyterlab/apputils';
import { RegulusPanel } from './';
/**
 * The console tracker token.
 */
export declare const IRegulusTracker: Token<IRegulusTracker>;
/**
 * A class that tracks console widgets.
 */
export interface IRegulusTracker extends IInstanceTracker<RegulusPanel> {
}
