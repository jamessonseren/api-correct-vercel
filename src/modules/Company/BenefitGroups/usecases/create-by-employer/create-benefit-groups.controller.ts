import { Request, Response } from "express";
import { CreateBenefitGroupsUsecase } from "./create-benefit-groups.usecase";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export class CreateBenefitGroupController {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository


  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body
      data.business_info_uuid = req.companyUser.businessInfoUuid
      data.uuid = req.body.uuid

      const usecase = new CreateBenefitGroupsUsecase(
        this.benefitGroupsRepository,
        this.userInfoRepository,
        this.employerItemsRepository
      )

      const result = await usecase.execute(data)

      return res.status(201).json(result)

    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error"
      });
    }
  }
}
