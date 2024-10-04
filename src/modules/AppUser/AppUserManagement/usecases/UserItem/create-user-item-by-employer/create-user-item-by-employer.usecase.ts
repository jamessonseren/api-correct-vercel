import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { AppUserItemCreateCommand, AppUserItemEntity } from "../../../entities/app-user-item.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputCreateAppUserItemByEmployerDTO } from "./dto/create-user-item-by-employer.dto";

export class CreateAppUserItemByEmployerUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository,
    private employerItemDetailsRepository: IBusinessItemDetailsRepository
  ) { }

  async execute(data: InputCreateAppUserItemByEmployerDTO) {
    const userItemEntityData: AppUserItemCreateCommand = {
      user_info_uuid: data.user_info_uuid ? new Uuid(data.user_info_uuid) : null,
      business_info_uuid: data.business_info_uuid ? new Uuid(data.business_info_uuid) : null,
      item_uuid: data.item_uuid ? new Uuid(data.item_uuid) : null,
      img_url: null,
      item_name: data.item_name,
      balance: data.balance,
      status: data.status,

    }
    const userItemEntity = AppUserItemEntity.create(userItemEntityData)
    if (userItemEntity.status === 'cancelled') throw new CustomError("Invalid status", 400);

    //check if appuser exists
    const userInfo = await this.appUserInfoRepository.find(userItemEntity.user_info_uuid)
    if (!userInfo) throw new CustomError("App User not found", 404);

    // Verificar se o usuário está associado ao negócio correto
    if (!userInfo.business_info_uuids.some(uuid => uuid === data.business_info_uuid)) {
      throw new CustomError("Unauthorized access", 403);
    }
    //check if business has this item
    const itemDetails = await this.employerItemDetailsRepository.findByItemUuidAndBusinessInfo(data.business_info_uuid, data.item_uuid)
    if (!itemDetails) throw new CustomError("This item is not available for current business", 403)

    userItemEntity.changeItemName(itemDetails.Item.name)

    // //check if user already has this item
    // const userItem = await this.appUserItemRepository.findByItemUuidAndUserInfo(userItemEntity.user_info_uuid.uuid, userItemEntity.item_uuid.uuid)
    // if (userItem) throw new CustomError("User already has this item", 409)

    //create user item
    await this.appUserItemRepository.create(userItemEntity)

    return {
      uuid: userItemEntity.uuid.uuid,
      user_info_uuid: userItemEntity.user_info_uuid.uuid,
      item_uuid: userItemEntity.item_uuid.uuid,
      item_name: userItemEntity.item_name,
      balance: userItemEntity.balance,
      status: userItemEntity.status,
      business_info_uuid: userItemEntity.business_info_uuid.uuid,
      created_at: userItemEntity.created_at
    }
  }
}
