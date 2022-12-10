import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AnyRecord } from 'dns';
import { lch } from 'd3';

interface IfcPrcAutJson {
    prcAutJson:{ [k: string]: any };
}

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
    /**
     * read process automation json PrcAut.pa.json
     */
	getChildren(element?: PrcAutTreeItem): Thenable<PrcAutTreeItem[]> {
            if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No PrcAutTreeItem in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
            return Promise.resolve(this.getTreeItemByPrcAutJson(element.getPrcAutJson()));
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
	 * Given the path to process automation json,
     * read content and build tree items
	 */
	private getPrcAutInJson(jsonPath: string): PrcAutTreeItem[] {
		const workspaceRoot = this.workspaceRoot;
		if (this.pathExists(jsonPath) && workspaceRoot) {
			const prcAutJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            
            return this.getTreeItemByPrcAutJson(prcAutJson);
		} else {
			return [];
		}
	}
    /**
     * evaluate json dictionary, looks for valid type set
     * checks if element has a child or children to create tree item
     * @param prcAutJson 
     * @returns list of tree items
     */
    private getTreeItemByPrcAutJson(prcAutJson:{ [k: string]: any }):PrcAutTreeItem[]{
        if (prcAutJson){

            let lChild:PrcAutTreeItem[]=[];
            for (const [sKey,o] of Object.entries(prcAutJson)){
                console.log(sKey);
                console.log(prcAutJson[sKey]);
                let sType=o._type;
                if (sType){
                    let iHasChild:number=0;
                    for (const [sKey,oC] of Object.entries(o)){
                        if (!sKey.startsWith('_')){
                            iHasChild++;
                        }
                    }
                    if (iHasChild>0){
                        lChild.push(new PrcAutTreeItem(sKey, sType,o, vscode.TreeItemCollapsibleState.Collapsed));
                    }else{
                        lChild.push(new PrcAutTreeItem(sKey, sType,o, vscode.TreeItemCollapsibleState.None));
                    }
                }
            }
            return lChild;
        }else{
            return [];
        }
    }
    /**
     * check if file exists
     * @param p 
     * @returns 
     */
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
    prcAutJson?:{ [k: string]: any };
	constructor(
		public readonly label: string,
		private readonly type: string,
		private readonly prcAutJson:{ [k: string]: any },
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
        this.prcAutJson=prcAutJson;
        this.version='';
		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
	}
    public getPrcAutJson():{ [k: string]: any } {
        return this.prcAutJson;
    }
	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}
