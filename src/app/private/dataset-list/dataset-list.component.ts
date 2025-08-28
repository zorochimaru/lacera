import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  CurrentLanguagePipe,
  DatasetItemFirestore,
  datasetList,
  DatasetService,
  FirestoreCollections,
  LangCodes
} from '../../core';
import { EditDatasetDialogComponent } from './edit-dataset-dialog/edit-dataset-dialog.component';

@Component({
    selector: 'app-dataset-list',
    imports: [RouterModule, DatePipe, DialogModule, CurrentLanguagePipe],
    templateUrl: './dataset-list.component.html',
    styleUrl: './dataset-list.component.scss'
})
export class DatasetListComponent implements OnInit {
  readonly #dialog = inject(Dialog);
  readonly #datasetService = inject(DatasetService);

  protected loading = signal(false);
  protected dataset = this.#datasetService.sourceData;
  protected datasetList = signal(datasetList);
  protected activeDataset = signal<FirestoreCollections>(
    datasetList[0].collection
  );

  public ngOnInit(): void {
    this.#datasetService.loadDataset(FirestoreCollections.categories);
  }

  protected editDataset(row: DatasetItemFirestore, i: number): void {
    this.#dialog
      .open<Record<LangCodes, string>>(EditDatasetDialogComponent, {
        data: row.name
      })
      .closed.subscribe(result => {
        if (result) {
          this.loading.set(true);
          this.#datasetService
            .updateValue(this.activeDataset(), row.id, {
              ...row,
              name: result
            })
            .subscribe(() => {
              this.loading.set(false);
              this.#datasetService.loadDataset(this.activeDataset(), true);
            });
        }
      });
  }

  protected createNew(): void {
    this.#dialog
      .open<Record<LangCodes, string>>(EditDatasetDialogComponent)
      .closed.subscribe(result => {
        if (result) {
          this.loading.set(true);
          this.#datasetService
            .createValue(this.activeDataset(), {
              name: result
            })
            .subscribe(() => {
              this.loading.set(false);
              this.#datasetService.loadDataset(this.activeDataset(), true);
            });
        }
      });
  }

  protected deleteDataset(id: string): void {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.loading.set(true);
    this.#datasetService.deleteValue(this.activeDataset(), id).subscribe(() => {
      this.loading.set(false);
      this.#datasetService.loadDataset(this.activeDataset(), true);
    });
  }

  protected selectActiveSource(datasetCollection: FirestoreCollections): void {
    this.activeDataset.set(datasetCollection);
    this.#datasetService.loadDataset(datasetCollection, true);
  }
}
