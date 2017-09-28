import { Widget } from '@phosphor/widgets';
import { IClientSession } from '@jupyterlab/apputils';
import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
/**
 * The class name of a cell whose input originated from a foreign session.
 */
export declare class Regulus extends Widget {
    constructor(options: Regulus.IOptions);
    /**
     * A signal emitted when the console finished executing its prompt cell.
     */
    readonly executed: ISignal<this, Date>;
    clear(): void;
    dispose(): void;
    readonly contentFactory: Regulus.IContentFactory;
    readonly session: IClientSession;
    private _content;
    protected onAfterAttach(msg: Message): void;
    protected onBeforeDetach(msg: Message): void;
    protected onActivateMessage(msg: Message): void;
    protected onUpdateRequest(msg: Message): void;
    /**
   * Update the console based on the kernel info.
   */
    private _handleInfo(info);
    private _onKernelChanged();
    private _executed;
    private _foreignHandler;
}
export declare namespace Regulus {
    interface IOptions {
        contentFactory: IContentFactory;
        session: IClientSession;
    }
    interface IContentFactory {
    }
    class ContentFactory implements IContentFactory {
        constructor(options?: ContentFactory.IOptions);
    }
    namespace ContentFactory {
        interface IOptions {
        }
    }
    const defaultContentFactory: IContentFactory;
}
