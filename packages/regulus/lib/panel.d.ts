import { IClientSession } from '@jupyterlab/apputils';
import { ServiceManager } from '@jupyterlab/services';
import { Token } from '@phosphor/coreutils';
import { Message } from '@phosphor/messaging';
import { Panel } from '@phosphor/widgets';
import { Regulus } from './widget';
/**
 * Regulus main panel
 */
export declare class RegulusPanel extends Panel {
    constructor(options: RegulusPanel.IOptions);
    readonly contentFactory: RegulusPanel.IContentFactory;
    readonly regulus: Regulus;
    readonly session: IClientSession;
    dispose(): void;
    protected onAfterAttach(msg: Message): void;
    protected onActivateRequest(msg: Message): void;
    protected onCloseRequest(msg: Message): void;
    private _updateTitle();
    private _manager;
    private _session;
    private _onExecuted(sender, args);
}
export declare namespace RegulusPanel {
    interface IOptions {
        contentFactory: IContentFactory;
        manager: ServiceManager.IManager;
        path?: string;
        basePath?: string;
        name?: string;
        kernelPreference?: IClientSession.IKernelPreference;
    }
    interface IContentFactory extends Regulus.IContentFactory {
        createRegulus(options: Regulus.IOptions): Regulus;
    }
    class ContentFactory extends Regulus.ContentFactory implements IContentFactory {
        createRegulus(options: Regulus.IOptions): Regulus;
    }
    namespace ContentFactory {
        interface IOptions extends Regulus.ContentFactory.IOptions {
        }
    }
    const defaultContentFactory: IContentFactory;
    const IContentFactory: Token<IContentFactory>;
}
