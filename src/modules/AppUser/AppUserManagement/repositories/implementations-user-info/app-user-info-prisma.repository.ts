import { date } from "zod";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../utils/date";
import { AppUserInfoEntity } from "../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../app-user-info.repository";
import { OutputGetEmployeesByBusinessDTO } from "../../usecases/UserInfo/get-users-by-business-admin/dto/get-user-by-business.dto";
import { randomUUID } from 'crypto'
import { urlencoded } from "express";
import { OutputFindUserDTO } from "../../usecases/UserInfo/get-user-info-by-user/dto/get-user-by-user.dto";
import { AppUserItemEntity } from "../../entities/app-user-item.entity";
import { BenefitGroupsEntity } from "../../../../Company/BenefitGroups/entities/benefit-groups.entity";

export class AppUserInfoPrismaRepository implements IAppUserInfoRepository {

  findByDocument2UserInfo(document2: string | null): Promise<AppUserInfoEntity> {
    throw new Error("Method not implemented.");
  }

  async create(data: AppUserInfoEntity): Promise<void> {
    await prismaClient.$transaction([

      prismaClient.userInfo.create({
        data: {
          uuid: data.uuid.uuid,
          businesses: {
            connect: data.business_info_uuids.map(business => ({ uuid: business }))
          },
          document: data.document,
          document2: data.document2,
          document3: data.document3,
          phone: data.phone,
          full_name: data.full_name,
          email: data.email,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          marital_status: data.marital_status,
          is_employee: data.is_employee,
          created_at: data.created_at,

        }
      }),

      prismaClient.userAuth.update({
        where: {
          document: data.document
        },
        data: {
          user_info_uuid: data.uuid.uuid,
          updated_at: newDateF(new Date())
        }
      })
    ])
  }
  update(entity: AppUserInfoEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<AppUserInfoEntity[]> {
    throw new Error("Method not implemented.");
  }
  async find(id: Uuid): Promise<AppUserInfoEntity | null> {

    const user = await prismaClient.userInfo.findUnique({
      where: {
        uuid: id.uuid
      },
      include: {
        businesses: true,
        Employee: true
      }
    })
    if (!user) return null

    return {
      uuid: new Uuid(user.uuid),
      business_info_uuids: user.Employee.map(business => business.business_info_uuid),
      address_uuid: user.address_uuid ? new Uuid(user.address_uuid) : null,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      email: user.email,
      status: user.status,
      recommendation_code: user.recommendation_code,
      is_authenticated: user.is_authenticated,
      marital_status: user.marital_status,
      is_employee: user.is_employee,
      user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
      created_at: user.created_at,
      updated_at: user.updated_at
    } as AppUserInfoEntity

  }

  async findManyByBusiness(business_info_uuid: string): Promise<OutputGetEmployeesByBusinessDTO[] | []> {
    const user = await prismaClient.employee.findMany({
      where: {
        business_info_uuid
      },
      include: {
        UserInfo: {
          include: {
            Address: true,
            UserItem: true
          }
        }
      }

    })
    return user as OutputGetEmployeesByBusinessDTO[] | []

  }

  async saveOrUpdateByCSV(userInfo: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<void> {
    await prismaClient.$transaction([
      prismaClient.userInfo.upsert({
        where: {
          document: userInfo.document
        },
        create: {
          uuid: userInfo.uuid.uuid,
          document: userInfo.document,
          document2: userInfo.document2,
          full_name: userInfo.full_name,
          gender: userInfo.gender,
          date_of_birth: userInfo.date_of_birth,
          phone: userInfo.phone,
          email: userInfo.email,
          status: userInfo.status,
          recommendation_code: userInfo.recommendation_code,
          is_authenticated: userInfo.is_authenticated,
          marital_status: userInfo.marital_status,
          is_employee: userInfo.is_employee,
          user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
          created_at: userInfo.created_at
        },
        update: {
          document: userInfo.document,
          document2: userInfo.document2,
          full_name: userInfo.full_name,
          gender: userInfo.gender,
          date_of_birth: userInfo.date_of_birth,
          phone: userInfo.phone,
          email: userInfo.email,
          status: userInfo.status,
          recommendation_code: userInfo.recommendation_code,
          is_authenticated: userInfo.is_authenticated,
          marital_status: userInfo.marital_status,
          is_employee: userInfo.is_employee,
          user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
          updated_at: userInfo.updated_at
        }
      }),

      ...employeeItem.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      )
    ]);
  }

  async createUserInfoAndEmployee(data: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<AppUserInfoEntity> {
    const [user, employee, empleeItem] = await prismaClient.$transaction([
      prismaClient.userInfo.create({
        data: {
          uuid: data.uuid.uuid,
          document: data.document,
          document2: data.document2,
          full_name: data.full_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          phone: data.phone,
          email: data.email,
          status: data.status,
          recommendation_code: data.recommendation_code,
          is_authenticated: data.is_authenticated,
          marital_status: data.marital_status,
          is_employee: data.is_employee,
          user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
          created_at: data.created_at
        }
      }),
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          business_info_uuid: data.business_info_uuid.uuid,
          company_internal_code: data.internal_company_code,
          salary: data.salary,
          job_title: data.function,
          company_owner: data.company_owner,
          dependents_quantity: data.dependents_quantity,
          created_at: data.created_at
        }
      }),
      ...employeeItem.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      )

    ])

    return {
      uuid: new Uuid(user.uuid),
      address_uuid: user.address_uuid ? new Uuid(user.address_uuid) : null,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      internal_company_code: employee.company_internal_code,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      email: user.email,
      salary: employee.salary,
      company_owner: employee.company_owner,
      status: user.status,
      function: employee.job_title,
      recommendation_code: user.recommendation_code,
      is_authenticated: user.is_authenticated,
      is_employee: user.is_employee,
      marital_status: user.marital_status,
      dependents_quantity: employee.dependents_quantity,
      user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
      created_at: user.created_at,
      updated_at: user.updated_at

    } as AppUserInfoEntity
  }

  async updateEmployeeByCSV(data: AppUserInfoEntity, employeeData: any, employeeItem: AppUserItemEntity[]): Promise<void> {

    await prismaClient.$transaction([
      prismaClient.userInfo.update({
        where: {
          document: data.document
        },
        data: {
          is_employee: data.is_employee,
          updated_at: data.updated_at
        },

      }),
      prismaClient.employee.update({
        where: {
          uuid: employeeData.uuid
        },
        data: {
          user_info_uuid: employeeData.uuid.uuid,
          business_info_uuid: employeeData.business_info_uuid.uuid,
          company_internal_code: employeeData.internal_company_code,
          salary: employeeData.salary,
          job_title: employeeData.function,
          company_owner: employeeData.company_owner,
          dependents_quantity: employeeData.dependents_quantity,
          updated_at: employeeData.updated_at
        }
      }),
      ...employeeItem.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      )

    ])


  }
  async createUserInfoandUpdateUserAuthByCSV(data: AppUserInfoEntity, employeeItemEntity: AppUserItemEntity[]) {
    await prismaClient.$transaction([
      prismaClient.userInfo.create({
        data: {
          uuid: data.uuid.uuid,
          document: data.document,
          document2: data.document2,
          full_name: data.full_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          phone: data.phone,
          email: data.email,
          status: data.status,
          recommendation_code: data.recommendation_code,
          is_authenticated: data.is_authenticated,
          marital_status: data.marital_status,
          is_employee: data.is_employee,
          user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
          created_at: data.created_at

        }
      }),
      prismaClient.userAuth.update({
        where: {
          document: data.document
        },
        data: {
          user_info_uuid: data.uuid.uuid,
          updated_at: newDateF(new Date())

        }
      }),
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          business_info_uuid: data.business_info_uuid.uuid,
          company_internal_code: data.internal_company_code,
          salary: data.salary,
          job_title: data.function,
          company_owner: data.company_owner,
          dependents_quantity: data.dependents_quantity,
          created_at: data.created_at
        }
      }),
      ...employeeItemEntity.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      ),
    ])
  }

  async findByDocumentUserInfo(document: string): Promise<OutputFindUserDTO | null> {
    const user = await prismaClient.userInfo.findUnique({
      where: {
        document: document
      },
      include: {
        Employee: true
      }
    });

    if (!user) return null;

    return {
      uuid: user.uuid,
      address_uuid: user.address_uuid,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      gender: user.gender,
      email: user.email,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      status: user.status,
      recommendation_code: user.recommendation_code,
      marital_status: user.marital_status,
      is_employee: user.is_employee,
      user_document_validation_uuid: user.user_document_validation_uuid,
      created_at: user.created_at,
      updated_at: user.updated_at,
      Employee: user.Employee.map(emp => ({
        uuid: emp.uuid,
        business_info_uuid: emp.business_info_uuid,
        internal_company_code: emp.company_internal_code ?? null,
        salary: emp.salary,
        company_owner: emp.company_owner ?? false,
        function: emp.job_title ?? null,
        dependents_quantity: emp.dependents_quantity ?? 0,
        created_at: emp.created_at,
        updated_at: emp.updated_at
      }))
    };
  }

  async createEmployeeAndItems(employeeInfoEntity: AppUserInfoEntity, employeeItemEntity: AppUserItemEntity[]): Promise<any> {
    const [employee, employeeItems, userInfo] = await prismaClient.$transaction([
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: employeeInfoEntity.uuid.uuid,
          business_info_uuid: employeeInfoEntity.business_info_uuid.uuid,
          company_internal_code: employeeInfoEntity.internal_company_code,
          salary: employeeInfoEntity.salary,
          dependents_quantity: employeeInfoEntity.dependents_quantity,
          job_title: employeeInfoEntity.function,
          company_owner: employeeInfoEntity.company_owner,
          created_at: employeeInfoEntity.created_at
        },

      }),
      ...employeeItemEntity.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      ),

      prismaClient.userInfo.update({
        where: {
          uuid: employeeInfoEntity.uuid.uuid
        },
        data: {
          is_employee: true,
          updated_at: employeeInfoEntity.updated_at
        }
      })
    ])

  }

  async findEmployee(user_info_uuid: string, business_info_uuid: string): Promise<any> {
    const employee = await prismaClient.employee.findFirst({
      where: {
        user_info_uuid: user_info_uuid,
        business_info_uuid: business_info_uuid
      },
      include: {
        UserInfo: {
          include: {
            Address: true,
            UserItem: true
          }
        }
      }
    })

    return employee
  }

  async updateEmployee(data: AppUserInfoEntity, employee_uuid: string): Promise<any> {
    const employee = await prismaClient.employee.update({
      where: {
        uuid: employee_uuid
      },
      data: {
        company_internal_code: data.internal_company_code,
        salary: data.salary,
        dependents_quantity: data.dependents_quantity,
        job_title: data.function,
        company_owner: data.company_owner,
        updated_at: data.updated_at
      }
    })

    return employee
  }

  async createOrUpdateUserInfoByEmployer(data: AppUserInfoEntity): Promise<void> {
    await prismaClient.userInfo.upsert({
      where: {
        document: data.document
      },
      create: {
        uuid: data.uuid.uuid,
        document: data.document,
        document2: data.document2,
        document3: data.document3,
        phone: data.phone,
        full_name: data.full_name,
        email: data.email,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        marital_status: data.marital_status,
        is_employee: data.is_employee,
        created_at: data.created_at
      },
      update: {
        is_employee: data.is_employee,
        updated_at: newDateF(new Date())
      }
    });
  }

  // async findByEmailUserInfo(email: string): Promise<UserInfoResponse | null> {
  //     const user = await prismaClient.userInfo.findUnique({
  //         where: {
  //             email
  //         },
  //         include: {
  //             BusinessInfo: {
  //                 select: {
  //                     fantasy_name: true
  //                 }
  //             },
  //             Address: true,
  //             UserValidation: true,
  //             UserAuth: {
  //                 select:{
  //                     uuid: true,
  //                     document: true,
  //                     email: true,
  //                 }
  //             }
  //         }
  //     })

  //     return user as UserInfoResponse | null
  // }


}
