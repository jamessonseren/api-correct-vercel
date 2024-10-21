import { Request, Response } from "express";
import { UpdateBenefitGroupsUsecase } from "./update-benefit-groups.usecase";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";

export class UpdateBenefitGroupController {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository


  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body
      data.business_info_uuid = req.companyUser.businessInfoUuid

      const usecase = new UpdateBenefitGroupsUsecase(
        this.benefitGroupsRepository,
        this.userInfoRepository,
        this.employerItemsRepository
      )

      const result = await usecase.execute(data)

      return res.status(200).json(result)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
