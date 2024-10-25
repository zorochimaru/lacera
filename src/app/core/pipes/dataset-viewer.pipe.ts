import { inject, Pipe, PipeTransform } from '@angular/core';
import { map, Observable } from 'rxjs';

import { FirestoreCollections, LangCodes } from '../interfaces';
import { DatasetService } from '../services';

@Pipe({
  name: 'datasetViewer',
  standalone: true
})
export class DatasetViewerPipe implements PipeTransform {
  readonly #datasetService = inject(DatasetService);
  transform(
    id: string,
    collection: FirestoreCollections
  ): Observable<Record<LangCodes, string> | null> {
    return this.#datasetService
      .getDatasetById(collection, id)
      .pipe(map(res => res?.name || null));
  }
}
