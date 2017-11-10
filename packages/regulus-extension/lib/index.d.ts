import { JupyterLabPlugin } from '@jupyterlab/application';
import { IRegulusTracker, RegulusPanel } from '@regulus/regulus';
export declare const trackerPlugin: JupyterLabPlugin<IRegulusTracker>;
export declare const contentFactoryPlugin: JupyterLabPlugin<RegulusPanel.IContentFactory>;
declare const plugins: JupyterLabPlugin<any>[];
export default plugins;
