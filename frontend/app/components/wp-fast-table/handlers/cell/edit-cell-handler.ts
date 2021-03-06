import {debugLog} from '../../../../helpers/debug_output';
import {WorkPackageTable} from '../../wp-fast-table';
import {States} from '../../../states.service';
import {cellClassName, editableClassName} from '../../builders/cell-builder';
import {TableEventHandler} from '../table-handler-registry';
import {injectorBridge} from '../../../angular/angular-injector-bridge.functions';
import {rowClassName} from '../../builders/rows/single-row-builder';
import {WorkPackageEditForm} from '../../../wp-edit-form/work-package-edit-form';
import {State} from '../../../../helpers/reactive-fassade';
import {TableRowEditContext} from '../../../wp-edit-form/table-row-edit-context';
import {ClickOrEnterHandler} from '../click-or-enter-handler';

export class EditCellHandler extends ClickOrEnterHandler implements TableEventHandler {
  // Injections
  public states:States;

  public get EVENT() {
    return 'click.table.cell, keydown.table.cell';
  }

  public get SELECTOR() {
    return `.${cellClassName}.${editableClassName}`;
  }

  public eventScope(table:WorkPackageTable) {
    return jQuery(table.container);
  }

  constructor() {
    super();
    injectorBridge(this);
  }

  protected processEvent(table: WorkPackageTable, evt:JQueryEventObject):boolean {
    debugLog('Starting editing on cell: ', evt.target);
    evt.preventDefault();

    // Locate the cell from event
    let target = jQuery(evt.target).closest(`.${cellClassName}`);
    // Get the target field name
    let fieldName = target.data('fieldName');

    if (!fieldName) {
      debugLog('Click handled by cell not a field? ', evt.target);
      return true;
    }

    // Locate the row
    const rowElement = target.closest(`.${rowClassName}`);
    const workPackageId = rowElement.data('workPackageId');

    // Get any existing edit state for this work package
    let state = this.editState(workPackageId);
    let form = state.getCurrentValue() || this.startEditing(state, workPackageId);

    // Set editing context to table
    form.editContext = new TableRowEditContext(workPackageId);

    // Activate the field
    form.activate(fieldName);

    return false;
  }

  private startEditing(state:State<WorkPackageEditForm>, workPackageId:string):WorkPackageEditForm {
    let form = new WorkPackageEditForm(workPackageId);
    state.put(form);
    return form;
  }

  /**
   * Retrieve the edit state for this work package
   */
  private editState(workPackageId:string):State<WorkPackageEditForm> {
    return this.states.editing.get(workPackageId);
  }
}

EditCellHandler.$inject = ['states'];
