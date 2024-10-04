import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { AppUserItemEntity } from "../../../entities/app-user-item.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { OutputFindAllAppUserItemsDTO } from "./dto/find-user-item.dto";

export class FindAllUserItemsByEmployerUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appuserInfoRepository: IAppUserInfoRepository
  ) { }

  async execute(user_info_uuid: string, business_info_uuid: string): Promise<OutputFindAllAppUserItemsDTO[] | []> {
    if (!user_info_uuid) throw new CustomError("User Info id is required", 400);

    // Check if app user exists
    const userInfo = await this.appuserInfoRepository.find(new Uuid(user_info_uuid));
    if (!userInfo) throw new CustomError("User not found", 404);
    if (!userInfo.business_info_uuids.some(uuid => uuid === business_info_uuid)) throw new CustomError("Unauthorized access", 403);

    const userItems = await this.appUserItemRepository.findAllUserItems(user_info_uuid);

    const filteredItems = userItems.filter((userItem: AppUserItemEntity) => userItem.business_info_uuid.uuid === business_info_uuid);

    if (userItems.length === 0) return [];
    return filteredItems.map((userItem: AppUserItemEntity) => {
      return {
        uuid: userItem.uuid.uuid,
        user_info_uuid: userItem.user_info_uuid.uuid,
        item_uuid: userItem.item_uuid.uuid,
        img_url: userItem.img_url,
        item_name: userItem.item_name,
        balance: userItem.balance,
        status: userItem.status,
        created_at: userItem.created_at,
        Provider:{
          business_info_uuid: userItem.business_info_uuid ? userItem.business_info_uuid.uuid : null,
          fantasy_name: userItem.fantasy_name
        }
      };
    });
  }
}
