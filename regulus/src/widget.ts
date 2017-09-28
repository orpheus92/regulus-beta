import {
  Panel, PanelLayout, Widget
} from '@phosphor/widgets';

import {
  ForeignHandler
} from './foreign';

import {
  IClientSession
} from '@jupyterlab/apputils';

//Some fix
import {
   KernelMessage
 } from '@jupyterlab/services';

import {
  Message
} from '@phosphor/messaging';

//Some fix
import {
  ISignal, Signal
} from '@phosphor/signaling';

const REGULUS_CLASS = 'jp-Regulus';
const CONTENT_CLASS = 'jp-Regulus-content';
/**
 * The class name of a cell whose input originated from a foreign session.
 */
//const FOREIGN_CELL_CLASS = 'jp-Regulus-foreignCell';


export
class Regulus extends Widget {
  constructor(options: Regulus.IOptions) {
    super();
    this.addClass(REGULUS_CLASS);
 //   console.log('Regulus widget');

    this.contentFactory = (
      options.contentFactory || Regulus.defaultContentFactory
    );

    this.session = options.session;
    this._content = new Panel();
    this._content.addClass(CONTENT_CLASS);

    let layout = this.layout = new PanelLayout();
    layout.addWidget(this._content);
 //   console.log('In Widget Constructor');

    // Set up the foreign iopub handler.
    this._foreignHandler = new ForeignHandler({
      session: this.session,
      parent: this,
   //   cellFactory: () => this._createCodeCell(),
    });

    this._onKernelChanged();
    this.session.kernelChanged.connect(this._onKernelChanged, this);

  }

//Some fix
  /**
   * A signal emitted when the console finished executing its prompt cell.
   */
  get executed(): ISignal<this, Date> {
    console.log("Finish execute in Regulus");
    return this._executed;
  }

  clear(): void {
	    console.log("Regulus Clear");
  }


  dispose() {
    // Do nothing if already disposed.
    if (this.isDisposed) {
      return;
    }
    this._foreignHandler.dispose();
    super.dispose();
  }

  readonly contentFactory: Regulus.IContentFactory;
  readonly session: IClientSession;

  private _content: Panel;

  protected onAfterAttach(msg: Message): void {
    console.log("widget: onAfterAttach:", msg);
  }

  protected onBeforeDetach(msg: Message): void {
    console.log("widget: onBeforeDetach:", msg);
  }

  protected onActivateMessage(msg: Message): void {
    console.log("widget: onActivateMessage:", msg);
  }

  protected onUpdateRequest(msg: Message): void {
    console.log("widget: onUpdateRequest:", msg);
  }
   //Some fix
    /**
   * Update the console based on the kernel info.
   */
  private _handleInfo(info: KernelMessage.IInfoReply): void {
    console.log("In HandleInfo");
  }

//Create a new foreign cell
/*
  private _createCodeCell(): CodeCell {
    let factory = this.contentFactory;
    let options = this._createCodeCellOptions();
    let cell = factory.createCodeCell(options);
    cell.readOnly = true;
    cell.model.mimeType = this._mimetype;
    cell.addClass(FOREIGN_CELL_CLASS);
    return cell;
  }
*/


  private _onKernelChanged(): void {

    let kernel = this.session.kernel;
    if (!kernel) {

      return;
    }
    kernel.ready.then(() => {
      if (this.isDisposed || !kernel || !kernel.info) {

        return;
      }
      // Some fix
      this._handleInfo(kernel.info);
    });
  }

  //Some fix
  private _executed = new Signal<this, Date>(this);
  private _foreignHandler: ForeignHandler;
}

export
namespace Regulus {

  export
  interface IOptions {
    contentFactory: IContentFactory;
    session: IClientSession;
  }

  export
  interface IContentFactory {}

  export
  class ContentFactory implements IContentFactory {
    constructor(options: ContentFactory.IOptions = {}) {
    }
  }

  export
  namespace ContentFactory {
    export
    interface IOptions {}
  }

  export
  const defaultContentFactory: IContentFactory = new ContentFactory();
}

// namespace Private {}
