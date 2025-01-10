import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export interface OutputGetBranchDTO {
  uuid: string,
  name: string,
  marketing_tax: number,
  admin_tax: number,
  market_place_tax: number,
  benefits_uuid?: string[],
  created_at: string,
  updated_at: string
}
