import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { OutputFindAppUserItemByIdDTO } from "./dto/find-user-item.dto";

export class FindUserItemByIdUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository
  ) { }

  async execute(user_item_uuid: string, business_user_business_info_uuid?: string, user_info_uuid?: string): Promise<OutputFindAppUserItemByIdDTO> {
    if (!user_item_uuid) throw new CustomError("User Item id is required", 400)

    const userItem = await this.appUserItemRepository.find(new Uuid(user_item_uuid))
    if (!userItem) throw new CustomError("User Item not found", 404)

    if (user_info_uuid && userItem.user_info_uuid?.uuid !== user_info_uuid) throw new CustomError("Unauthorized access for user", 403)

    if (business_user_business_info_uuid) {
      const userInfo = await this.appUserInfoRepository.find(userItem.user_info_uuid)

      if (!userInfo) throw new CustomError("User not found", 404)
      if (userInfo.business_info_uuid.uuid !== business_user_business_info_uuid) {
        throw new CustomError("Unauthorized Acess for business admin", 403)
      }
    }


    return {
      uuid: userItem.uuid.uuid,
      user_info_uuid: userItem.user_info_uuid.uuid,
      item_uuid: userItem.item_uuid.uuid,
      img_url: userItem.img_url ? userItem.img_url : null,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status,
      blocked_at: userItem.blocked_at ? userItem.blocked_at : null,
      cancelled_at: userItem.cancelled_at ? userItem.cancelled_at : null,
      cancelling_request_at: userItem.cancelling_request_at ? userItem.cancelling_request_at : null,
      block_reason: userItem.block_reason ? userItem.block_reason : null,
      cancel_reason: userItem.cancel_reason ? userItem.cancel_reason : null,
      grace_period_end_date: userItem.grace_period_end_date ? userItem.grace_period_end_date : null,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at
    }
  }
}