import { Datasource } from '../interface';
import mockDSMeta from '../mock';

export async function getDSMetadata(): Promise<Datasource[]> {
  return mockDSMeta;
}