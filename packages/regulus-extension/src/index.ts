import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
   Dialog, ICommandPalette, IMainMenu, InstanceTracker, showDialog
} from '@jupyterlab/apputils';

import {
  PageConfig
} from '@jupyterlab/coreutils';

import {
  ILauncher
} from '@jupyterlab/launcher';

import {
  Menu
} from '@phosphor/widgets';

import {
  find
} from '@phosphor/algorithm';

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils';

import {
  IRegulusTracker, RegulusPanel
} from '@regulus/regulus';

namespace CommandIDs {
  export
  const open = 'regulus:open';

  export
  const interrupt = 'regulus:interrupt-kernel';

  export
  const create = 'regulus:create';

  export
  const clear = 'regulus:clear';

  export
  const restart = 'regulus:restart-kernel';

  export
  const closeAndShutdown = 'regulus:close-and-shutdown';

//  export
//  const inject = 'regulus:inject';

  export
  const changeKernel = 'regulus:change-kernel';
};

export
const trackerPlugin: JupyterLabPlugin<IRegulusTracker> = {
  id: 'jupyter.services.regulus-tracker',
  provides: IRegulusTracker,
  requires: [
    IMainMenu,
    ICommandPalette,
    RegulusPanel.IContentFactory,
    ILayoutRestorer
  ],
  optional: [ILauncher],
  activate: activateRegulus,
  autoStart: true
};


export
const contentFactoryPlugin: JupyterLabPlugin<RegulusPanel.IContentFactory> = {
  id: 'jupyter.services.regulus-renderer',
  provides: RegulusPanel.IContentFactory,
  requires: [],
  autoStart: true,
  activate: (app: JupyterLab) => {
    return new RegulusPanel.ContentFactory();
  }
};

const plugins: JupyterLabPlugin<any>[] = [contentFactoryPlugin, trackerPlugin];
export default plugins;

function activateRegulus(app: JupyterLab, mainMenu: IMainMenu, palette: ICommandPalette, contentFactory: RegulusPanel.IContentFactory, restorer: ILayoutRestorer, launcher: ILauncher | null): IRegulusTracker {
  let manager = app.serviceManager;
  //console.log("===== In function activateRegulus");
  //console.log(app);
  //console.log(manager);
  let { commands, shell } = app;
  let category = 'Regulus';
  let command: string;
  let menu = new Menu({ commands });

  const tracker = new InstanceTracker<RegulusPanel>({ namespace: 'regulus' });

  restorer.restore(tracker, {
    command: CommandIDs.open,
    args: panel => {
      console.log('panel', panel);
      return {
      path: panel.regulus.session.path,
      name: panel.regulus.session.name
    }},
    name: panel => { console.log('name from panel', panel); return panel.regulus.session.path},
    when: manager.ready
  });

  // Update the command registry when the regulus state changes.
  tracker.currentChanged.connect(() => {
    console.log('tracker.currentChanged')
    if (tracker.size <= 1) {
      commands.notifyCommandChanged(CommandIDs.interrupt);
    }
  });

  // The launcher callback.
  let callback = (cwd: string, name: string) => {
    return createRegulus({basePath: cwd, kernelPreference: { name }});
  };

  // Add a launcher item if the launcher is available.
  if (launcher) {
    manager.ready.then(() => {
      const specs = manager.specs;
      if (!specs) {
        return;
      }
      let baseUrl = PageConfig.getBaseUrl();
      for (let name in specs.kernelspecs) {
        let displayName = specs.kernelspecs[name].display_name;
        let rank = name === specs.default ? 0 : Infinity;
        let kernelIconUrl = specs.kernelspecs[name].resources['logo-64x64'];
        if (kernelIconUrl) {
          let index = kernelIconUrl.indexOf('kernelspecs');
          kernelIconUrl = baseUrl + kernelIconUrl.slice(index);
        }
        launcher.add({
          displayName,
          category: 'Regulus',
          name,
          iconClass: 'jp-Regulus',
          callback,
          rank,
          kernelIconUrl
        });
      }
    });
  }

  menu.title.label = category;

  function createRegulus(options: Partial<RegulusPanel.IOptions>): Promise<RegulusPanel> {
    return manager.ready.then(() => {
      //console.log('Jupyter Service manager before');
      //console.log(manager);
      let panel = new RegulusPanel({
        manager,
        contentFactory,
        ...options
      });
      //console.log(manager);
      //console.log(panel);
      // Add the regulus panel to the tracker.
      tracker.add(panel);
      shell.addToMainArea(panel);
      shell.activateById(panel.id);
      return panel;
    });
  }

  function hasWidget(): boolean {
    return tracker.currentWidget !== null;
  }

command = CommandIDs.open;
  commands.addCommand(command, {
    execute: (args: Partial<RegulusPanel.IOptions>) => {

      let path = args['path'];
      let widget = tracker.find(value => {
        return value.regulus.session.path === path;
      });
      if (widget) {
        shell.activateById(widget.id);
      } else {
        return manager.ready.then(() => {
          let model = find(manager.sessions.running(), item => {
            return item.path === path;
          });
          if (model) {
            return createRegulus(args);
          }
          return Promise.reject(`No running regulus for path: ${path}`);
        });
      }
    },
  });

  command = CommandIDs.create;
  commands.addCommand(command, {
    label: 'Start New Regulus',
    execute: (args: Partial<RegulusPanel.IOptions>) => {
      let basePath = args.basePath || '.';
      //console.log("CommandIDs.create args");
      //console.log(args);
      return createRegulus({ basePath, ...args });
    }
  });
  palette.addItem({ command, category });


  function getCurrent(args: ReadonlyJSONObject): RegulusPanel | null {
    let widget = tracker.currentWidget;
    let activate = args['activate'] !== false;
    if (activate && widget) {
      shell.activateById(widget.id);
    }
    return widget;
  }

  command = CommandIDs.clear;
  commands.addCommand(command, {
    label: 'Clear Regulus',
    execute: args => {
      let current = getCurrent(args);
      if (!current) {
        return;
      }
      current.regulus.clear();
    },
    isEnabled: hasWidget
  });
  palette.addItem({ command, category });



  command = CommandIDs.interrupt;
  commands.addCommand(command, {
    label: 'Interrupt Kernel',
    execute: args => {

      let current = getCurrent(args);
      if (!current) {
        return;
      }
      let kernel = current.regulus.session.kernel;
      if (kernel) {
        return kernel.interrupt();
      }
    },
    isEnabled: hasWidget
  });
  palette.addItem({ command, category });
  
  command = CommandIDs.restart;
  commands.addCommand(command, {
    label: 'Restart Kernel',
    execute: args => {
      let current = getCurrent(args);
      if (!current) {
        return;
      }
      return current.regulus.session.restart();
    },
    isEnabled: hasWidget
  });
  palette.addItem({ command, category });

command = CommandIDs.closeAndShutdown;
  commands.addCommand(command, {
    label: 'Close and Shutdown',
    execute: args => {
      const current = getCurrent(args);
      if (!current) {
        return;
      }
      return showDialog({
        title: 'Shutdown the regulus?',
        body: `Are you sure you want to close "${current.title.label}"?`,
        buttons: [Dialog.cancelButton(), Dialog.warnButton()]
      }).then(result => {
        if (result.button.accept) {
          current.regulus.session.shutdown().then(() => {
            current.dispose();
          });
        } else {
          return false;
        }
      });
    },
    isEnabled: hasWidget
  });

  command = CommandIDs.changeKernel;
  commands.addCommand(command, {
    label: 'Change Kernel',
    execute: args => {
      let current = getCurrent(args);
      if (!current) {
        return;
      }
      return current.regulus.session.selectKernel();
    },
    isEnabled: hasWidget
  });
  palette.addItem({ command, category });

//  menu.addItem({ command: CommandIDs.run });
//  menu.addItem({ command: CommandIDs.runForced });
//  menu.addItem({ command: CommandIDs.linebreak });
//  menu.addItem({ type: 'separator' });
  menu.addItem({ command: CommandIDs.clear });
  menu.addItem({ type: 'separator' });
  menu.addItem({ command: CommandIDs.interrupt });
  menu.addItem({ command: CommandIDs.restart });
  menu.addItem({ command: CommandIDs.changeKernel });
  menu.addItem({ type: 'separator' });
  menu.addItem({ command: CommandIDs.closeAndShutdown });

  mainMenu.addMenu(menu, {rank: 50});

  app.contextMenu.addItem({command: CommandIDs.clear, selector: '.jp-CodeRegulus'});
  app.contextMenu.addItem({command: CommandIDs.restart, selector: '.jp-CodeRegulus'});

  return tracker;
}
