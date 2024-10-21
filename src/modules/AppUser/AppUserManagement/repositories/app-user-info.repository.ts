import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { BenefitGroupsEntity } from "../../../Company/BenefitGroups/entities/benefit-groups.entity";
import { AppUserInfoEntity } from "../entities/app-user-info.entity";
import { AppUserItemEntity } from "../entities/app-user-item.entity";
import { OutputFindUserDTO } from "../usecases/UserInfo/get-user-info-by-user/dto/get-user-by-user.dto";
import { OutputGetEmployeesByBusinessDTO } from "../usecases/UserInfo/get-users-by-business-admin/dto/get-user-by-business.dto";

export interface IAppUserInfoRepository extends RepositoryInterface<AppUserInfoEntity> {
  saveOrUpdateByCSV(userInfo: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<void>
  findByDocumentUserInfo(document: string): Promise<OutputFindUserDTO | null>
  // save(data: AppUserInfoEntity): Promise<void>
  // findByEmailUserInfo(email: string): Promise<UserInfoResponse | null>
  findByDocument2UserInfo(document2: string | null): Promise<AppUserInfoEntity>
  // findByDocument3UserInfo(document3: string | null): Promise<AppUserInfoEntity>
  findManyByBusiness(business_info_uuid: string): Promise<OutputGetEmployeesByBusinessDTO[] | []>
  createUserInfoandUpdateUserAuthByCSV(data: AppUserInfoEntity, employeeItemEntity: AppUserItemEntity[]): Promise<void>
  createOrUpdateUserInfoByEmployer(data: AppUserInfoEntity): Promise<void>
  createUserInfoAndEmployee(data: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<AppUserInfoEntity>
  createEmployeeAndItems(employeeInfo: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<any>
  updateEmployee(data: AppUserInfoEntity, employee_uuid:string): Promise<any>
  findEmployee(user_info_uuid: string, business_info_uuid: string): Promise<any>
  updateEmployeeByCSV(userInfo: AppUserInfoEntity, employeeData: any, employeeItem: AppUserItemEntity[]): Promise<void>
}
