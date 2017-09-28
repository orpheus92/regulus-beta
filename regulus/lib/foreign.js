"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
var signaling_1 = require("@phosphor/signaling");
/**
 * A handler for capturing API messages from other sessions that should be
 * rendered in a given parent.
 */
var ForeignHandler = /** @class */ (function () {
    /**
     * Construct a new foreign message handler.
     */
    function ForeignHandler(options) {
        /**
         * Create a new code cell for an input originated from a foreign session.
         */
        /* private _newCell(parentMsgId: string): CodeCell {
          // console.log("Create a new code cell for an input originated from a foreign session");
           let cell = this._factory();
           this._cells.set(parentMsgId, cell);
           this._parent.addCell(cell);
           return cell;
         }
       */
        // private _cells = new Map<string, CodeCell>();
        this._enabled = true;
        // private _factory: () => CodeCell;
        this._isDisposed = false;
        // console.log("ForeignHandler Constructor");
        // console.log(options);
        this.session = options.session;
        this.session.iopubMessage.connect(this.onIOPubMessage, this);
        //this._factory = options.cellFactory;
        this._parent = options.parent;
    }
    Object.defineProperty(ForeignHandler.prototype, "enabled", {
        /**
         * Set whether the handler is able to inject foreign cells into a console.
         */
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            this._enabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForeignHandler.prototype, "parent", {
        /**
         * The foreign handler's parent receiver.
         */
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForeignHandler.prototype, "isDisposed", {
        /**
         * Test whether the handler is disposed.
         */
        get: function () {
            return this._isDisposed;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose the resources held by the handler.
     */
    ForeignHandler.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        //this._cells.clear();
        signaling_1.Signal.clearData(this);
    };
    /**
     * Handler IOPub messages.
     *
     * @returns `true` if the message resulted in a new cell injection or a
     * previously injected cell being updated and `false` for all other messages.
     */
    ForeignHandler.prototype.onIOPubMessage = function (sender, msg) {
        //    console.log("#### In onIOPubMessage");
        //    console.log(sender);
        //    console.log(msg);
        // Only process messages if foreign cell injection is enabled.
        if (!this._enabled) {
            return false;
        }
        var kernel = this.session.kernel;
        if (!kernel) {
            return false;
        }
        // Check whether this message came from an external session.
        var parent = this._parent;
        var session = msg.parent_header.session;
        console.log("Check whether this message came from an external session:");
        console.log(session);
        console.log(kernel);
        if (session === kernel.clientId) {
            return false;
        }
        var msgType = msg.header.msg_type;
        var parentHeader = msg.parent_header;
        var parentMsgId = parentHeader.msg_id;
        //let cell: CodeCell | undefined;
        console.log("msgType");
        console.log(msgType);
        switch (msgType) {
            case 'execute_input':
                var inputMsg = msg;
                //cell = this._newCell(parentMsgId);
                console.log(inputMsg);
                console.log(inputMsg.content.code);
                console.log("parentMsgId");
                console.log(parentMsgId);
                //let model = cell.model;
                //model.executionCount = inputMsg.content.execution_count;
                //model.value.text = inputMsg.content.code;
                //model.trusted = true;
                //console.log("Model in Execute_Input");
                //console.log(model);
                parent.update();
                return true;
            case 'execute_result':
            case 'display_data':
            case 'stream':
            case 'error':
                /*    if (!this._cells.has(parentMsgId)) {
                      // This is an output from an input that was broadcast before our
                      // session started listening. We will ignore it.
                      console.warn('Ignoring output with no associated input cell.');
                      return false;
                    }
                   */
                var output = msg.content;
                /*      cell = this._cells.get(parentMsgId);
                      if (cell) {
                        output.output_type = msgType as nbformat.OutputType;
                        cell.model.outputs.add(output);
                      }
                */
                console.log("Output = ");
                console.log(output);
                parent.update();
                return true;
            case 'clear_output':
                //   let wait = (msg as KernelMessage.IClearOutputMsg).content.wait;
                /*    cell = this._cells.get(parentMsgId);
                    if (cell) {
                      cell.model.outputs.clear(wait);
                    }
              */
                return true;
            default:
                return false;
        }
    };
    return ForeignHandler;
}());
exports.ForeignHandler = ForeignHandler;
