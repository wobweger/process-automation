import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AnyRecord } from 'dns';
import { lch } from 'd3';

export class PrcAutDataProvider implements vscode.TreeDataProvider<PrcAutTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<PrcAutTreeItem | undefined | void> = new vscode.EventEmitter<PrcAutTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<PrcAutTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: PrcAutTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: PrcAutTreeItem): Thenable<PrcAutTreeItem[]> {
    //getChildren(element?: PrcAutTreeItem): PrcAutTreeItem[] {
            if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No PrcAutTreeItem in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
            var lstChild:PrcAutTreeItem[]=[];
            //for (o in element.getChildren()){
            //element.children
            element.getChildren().forEach(function(o){
                    lstChild.push(o);
            });
            return Promise.resolve(lstChild);
			//return Promise.resolve(this.getPrcAutInJson(path.join(this.workspaceRoot, element.label, 'PrcAut.pa.json')));
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'PrcAut.pa.json');
			if (this.pathExists(packageJsonPath)) {
				return Promise.resolve(this.getPrcAutInJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no PrcAut.pa.json');
				return Promise.resolve([]);
			}
		}

	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getPrcAutInJson(jsonPath: string): PrcAutTreeItem[] {
		const workspaceRoot = this.workspaceRoot;
		if (this.pathExists(jsonPath) && workspaceRoot) {
			const prcAutJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            //const prcAutDat=prcAutJson.data;
            //const prcAutMap=new Map(Object.entries(prcAutDat));
            //var tree={};
			const toPrcAut = (moduleName: string, type:string,child:{ [k: string]: any }) : PrcAutTreeItem => {
				if (child) {
					var prcAutPar=new PrcAutTreeItem(moduleName, type,"", vscode.TreeItemCollapsibleState.Collapsed);
                    var lChild:PrcAutTreeItem[]=[];
                    for (const [sKey,o] of Object.entries(child)){
                        console.log(sKey);
                        var sType=o._type;
                        if (sType){
                            console.log(child[sKey]);
                            var oChild=toPrcAut(sKey,sType,o);
                            lChild.push(oChild);
                            //var prcAutChild=toPrcAut(sKey, sType,"", child.get(sKey));
                        }
                    }
                    //const lstPrcAut = child
				    //    ? Object.keys(child).map(prcAut => toPrcAut(prcAut, child[prcAut]['_type'],child[prcAut]))
				    //    : [];
                    prcAutPar.setChildren(lChild);
                    return prcAutPar;
				} else {
					return new PrcAutTreeItem(moduleName, type,"", vscode.TreeItemCollapsibleState.None, {
						command: 'extension.openPackageOnNpm',
						title: '',
						arguments: [moduleName]
					});
				}
			};
            var lChild:PrcAutTreeItem[]=[];
            for (const [sKey,o] of Object.entries(prcAutJson)){
                console.log(sKey);
                //var o=prcAutJson.get(sKey);
                var sType=o._type;
                if (sType){
                    //var prcAutPar=new PrcAutTreeItem(sKey, sType,"", vscode.TreeItemCollapsibleState.Collapsed);
                    //var prcAutJson.get(sKey);
                    var oChild=toPrcAut(sKey,sType,o);
                    lChild.push(oChild);
                }
                console.log(prcAutJson[sKey]);
                //var sType=o.get('_type');
            }

			//const lstPrcAut = prcAutJson
			//	? Object.keys(prcAutJson).map(prcAut => toPrcAut(prcAut, prcAutJson[prcAut]['_type'],prcAutJson[prcAut]))
			//	: [];
			//const devDeps = packageJson.devDependencies
			//	? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
			//	: [];
			//return deps.concat(devDeps);
            return lChild;
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class PrcAutTreeItem extends vscode.TreeItem {
    children?:PrcAutTreeItem[];
	constructor(
		public readonly label: string,
		private readonly type: string,
		private readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
        this.children=undefined;
	}
    public setChildren(params:PrcAutTreeItem[]) {
        this.children=params;
    }
    public getChildren():PrcAutTreeItem[] {
        return this.children;
    }
	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}
