import { GetUserInfoByUserUsecase } from '../get-user-info-by-user.usecase'

const AppUserInfoMockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        saveOrUpdate: jest.fn(),
        findByDocumentUserInfo: jest.fn(),
        save: jest.fn(),
        findByDocument2UserInfo: jest.fn(),
        findManyByBusiness:jest.fn()

    };
};

const BusinessInfoMockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        findByDocument: jest.fn(),
        findById: jest.fn(),
        findByEmail: jest.fn(),
        deleteById: jest.fn()
    }
}

describe("Unity test get user info by user usecase", () => {


    it("Should return user with null business info uuid", async () => {
        const appUserInfoRepository = AppUserInfoMockRepository()
        const businessInfoRepository = BusinessInfoMockRepository()

        const input = {
            document: '123.456.789-05'
        }

        appUserInfoRepository.findByDocumentUserInfo.mockResolvedValueOnce({

        })

        const usecase = new GetUserInfoByUserUsecase(appUserInfoRepository, businessInfoRepository)

        try{
            await usecase.execute(input)

        }catch(err: any){
            expect(err.message).toBe("User info not found")
            expect(err.statusCode).toBe(404)
        }
    })
})