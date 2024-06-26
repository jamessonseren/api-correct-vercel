import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../utils/date";
import { AppUserDataEntity } from "../../../UserByCorrect/entities/appuser-data.entity";
import { UserInfoResponse, AppUserInfoRequest } from "../../../app-user-dto/app-user.dto";
import { AppUserInfoEntity } from "../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../app-user-info.repository";

export class AppUserInfoPrismaRepository implements IAppUserInfoRepository {
    async findManyByBusiness(business_info_uuid: string): Promise<UserInfoResponse[] | []> {
       const user = await prismaClient.userInfo.findMany({
            where:{
                business_info_uuid
            },
            include: {
                BusinessInfo: {
                    select: {
                        fantasy_name: true
                    }
                },
                Address: true,
                UserValidation: {
                    select: {
                        uuid: true,
                        document_front_status: true,
                        document_back_status: true,
                        selfie_status: true,
                        document_selfie_status: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                
                
            }
        })

        if(user.length > 0) return user as UserInfoResponse[]

        return []
    }
    async saveOrUpdate(data: AppUserInfoEntity): Promise<void> {
        await prismaClient.userInfo.upsert({
            where:{
                document: data.document
            },
            create:{
                uuid: data.uuid,
                business_info_uuid: data.business_info_uuid,
                document: data.document,
                document2: data.document2,
                full_name: data.full_name,
                internal_company_code: data.internal_company_code,
                gender: data.gender,
                date_of_birth: data.date_of_birth,
                salary: data.salary,
                company_owner: data.company_owner,
                marital_status: data.marital_status,
                dependents_quantity: data.dependents_quantity,
                created_at: data.created_at

            },
            update:{
                document: data.document,
                document2: data.document2,
                full_name: data.full_name,
                internal_company_code: data.internal_company_code,
                gender: data.gender,
                date_of_birth: data.date_of_birth,
                salary: data.salary,
                company_owner: data.company_owner,
                marital_status: data.marital_status,
                dependents_quantity: data.dependents_quantity,
                updated_at: newDateF(new Date())

            }
        })

       
    }
    

    async findById(id: string): Promise<UserInfoResponse | null> {
        const user = await prismaClient.userInfo.findUnique({
            where: {
                uuid: id
            },
            include: {
                BusinessInfo: {
                    select: {
                        fantasy_name: true
                    }
                },
                Address: true,
                UserValidation: {
                    select: {
                        uuid: true,
                        document_front_status: true,
                        document_back_status: true,
                        selfie_status: true,
                        document_selfie_status: true,
                        document_back_base64: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                
                
            }
        })

        return user as UserInfoResponse | null
    }

    async save(data: AppUserInfoEntity): Promise<void> {

        await prismaClient.$transaction([

            prismaClient.userInfo.create({
                data: {
                    uuid: data.uuid,
                    business_info_uuid: data.business_info_uuid,
                    document: data.document,
                    document2: data.document2,
                    full_name: data.full_name,
                    internal_company_code: data.internal_company_code,
                    gender: data.gender,
                    date_of_birth: data.date_of_birth,
                    salary: data.salary,
                    company_owner: data.company_owner,
                    marital_status: data.marital_status,
                    dependents_quantity: data.dependents_quantity,
                    created_at: newDateF(new Date()),
                    
                }
            }),

            prismaClient.userAuth.update({
                where: {
                    document: data.document
                },
                data: {
                    user_info_uuid: data.uuid,
                    updated_at: newDateF(new Date())
                }
            })
        ])
    }
   

    async findByDocumentUserInfo(document: string): Promise<UserInfoResponse | null> {
        const user = await prismaClient.userInfo.findUnique({
            where: {
                document
            },
            include:{
                BusinessInfo:{
                    select:{
                        fantasy_name: true
                    }
                },
                Address: true,
                UserValidation: {
                    select:{
                        uuid: true,
                        document_front_status: true,
                        document_back_status: true,
                        selfie_status: true,
                        document_selfie_status: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                UserAuth: {
                    select:{
                        uuid: true,
                        document: true,
                        email: true,
                    }
                }
            }
            
        })

        return user as UserInfoResponse | null
    }

    async findByEmailUserInfo(email: string): Promise<UserInfoResponse | null> {
        const user = await prismaClient.userInfo.findUnique({
            where: {
                email
            },
            include: {
                BusinessInfo: {
                    select: {
                        fantasy_name: true
                    }
                },
                Address: true,
                UserValidation: true,
                UserAuth: {
                    select:{
                        uuid: true,
                        document: true,
                        email: true,
                    }
                }
            }
        })

        return user as UserInfoResponse | null
    }

    async findByDocument2UserInfo(document2: string): Promise<UserInfoResponse | null> {
        const user = await prismaClient.userInfo.findUnique({
            where: {
                document2
            },
            include: {
                BusinessInfo: {
                    select: {
                        fantasy_name: true
                    }
                },
                Address: true,
                UserValidation: true,
                UserAuth: {
                    select:{
                        uuid: true,
                        document: true,
                        email: true,
                    }
                }
            }
        })

        return user as UserInfoResponse | null
    }
    async findByDocument3UserInfo(document3: string): Promise<UserInfoResponse | null> {
        const user = await prismaClient.userInfo.findFirst({
            where: {
                document3
            },
            include: {
                BusinessInfo: {
                    select: {
                        fantasy_name: true
                    }
                },
                Address: true,
                UserValidation: true,
                UserAuth: {
                    select:{
                        uuid: true,
                        document: true,
                        email: true,
                    }
                }
            }
        })

        return user as UserInfoResponse | null
    }



}