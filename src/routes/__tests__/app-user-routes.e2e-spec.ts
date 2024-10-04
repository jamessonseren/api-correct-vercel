import request from "supertest"
import { app } from "../../app"
import { InputCreateAppUserDTO } from "../../modules/AppUser/app-user-dto/app-user.dto"
import { InputCreateUserInfoDTO } from "../../modules/AppUser/AppUserManagement/usecases/UserInfo/create-user-info/dto/create-user-info.dto";
import { InputUpdateAppUserAddressDTO } from "../../modules/AppUser/AppUserManagement/usecases/UserAddress/update-app-user-address/dto/update-app-user-address.dto";
import { Uuid } from "../../@shared/ValueObjects/uuid.vo";
import { InputCreateBenefitDto } from "../../modules/benefits/usecases/create-benefit/create-benefit.dto";
import path from 'path'
import { randomUUID } from 'crypto'
import { UserItemStatus } from "@prisma/client";
import { create } from "lodash";

let userToken1: string;
let userToken2: string;
let userToken3: string

let correctAdminToken: string
let partner_info_uuid: string
let business_address_uuid: string

let employer_info_uuid: string
let employer_info_uuid2: string
let employer_info_uuid3: string

let employee_user_info: string
let employeeAuthToken: string
let employeeAuthToken2: string

let non_employee_user_info: string

let employer_user_uuid: string
let employer_user_uuid2: string
let employer_user_uuid3: string

let employer_user_token: string
let employer_user_token2: string
let employer_user_token3: string

let business_user_token: string
let business_admin_uuid: string
let company_user_uuid: string

let benefit1_uuid: Uuid
let benefit2_uuid: Uuid
let benefit3_uuid: Uuid
let benefit4_uuid: Uuid


let branch1_uuid: string
let branch2_uuid: string
let branch3_uuid: string
let branch4_uuid: string
let branch5_uuid: string

const documentUser1 = '875.488.760-76'
const documentUser2 = '475.953.480-64'
const documentUser3 = '694.438.610-03'


const inputNewAppUser1: InputCreateAppUserDTO = {
  user_info_uuid: null,
  document: documentUser1,
  email: 'email@email.com',
  password: 'senha123',
  is_active: true
}

const inputNewAppUser2: InputCreateAppUserDTO = {
  user_info_uuid: null,
  document: '283.330.980-53',
  email: 'email2@email.com',
  password: 'senha123',
  is_active: true
}

const inputNewAppUser3: InputCreateAppUserDTO = {
  user_info_uuid: null,
  document: '915.583.910-02',
  email: 'email3@email.com',
  password: 'senha123',
  is_active: true
}

const authenticateAppUser1 = {
  document: inputNewAppUser1.document,
  password: inputNewAppUser1.password
}

const authenticateAppUser2 = {
  document: inputNewAppUser2.document,
  password: inputNewAppUser2.password
}

const authenticateAppUser3 = {
  document: inputNewAppUser3.document,
  password: inputNewAppUser3.password
}

describe("E2E App User tests", () => {

  beforeAll(async () => {
    const inputNewAdmin = {
      name: "Admin Correct",
      email: "admincorrect@correct.com.br",
      userName: "admin-correct",
      password: "123"
    }
    //create correct admin
    await request(app).post('/admin').send(inputNewAdmin)

    const authenticateAdmin = {
      userName: inputNewAdmin.userName,
      password: inputNewAdmin.password
    }
    //authenticate correct admin
    const result = await request(app).post('/login').send(authenticateAdmin)
    correctAdminToken = result.body.token

    //create items
    const benefit1: InputCreateBenefitDto = {
      name: "Vale Alimentação",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pre_pago',
    }


    const benefit2: InputCreateBenefitDto = {
      name: "Adiantamento Salarial",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pos_pago',
    }
    const benefit3: InputCreateBenefitDto = {
      name: "Convênio",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pos_pago',
    }
    const benefit4: InputCreateBenefitDto = {
      name: "Vale Refeição",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pre_pago',
    }


    const benefit1Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit1);
    const benefit2Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit2);
    const benefit3Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit3);
    const benefit4Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit4);

    benefit1_uuid = benefit1Response.body.uuid
    benefit2_uuid = benefit2Response.body.uuid
    benefit3_uuid = benefit3Response.body.uuid
    benefit4_uuid = benefit4Response.body.uuid


    //create branches
    const branchesByName = [
      {
        name: "Hipermercados",
        marketing_tax: 100,
        admin_tax: 150,
        market_place_tax: 120,
        benefits_name: ['Adiantamento Salarial', 'Vale Alimentação']
      },

      {
        name: "Supermercados",
        marketing_tax: 100,
        admin_tax: 150,
        market_place_tax: 120,
        benefits_name: ['Adiantamento Salarial', 'Vale Refeição']
      },

      {
        name: "Mercearias",
        marketing_tax: 130,
        admin_tax: 140,
        market_place_tax: 130,
        benefits_name: ['Convênio', 'Vale Alimentação']
      },
      {
        name: "Restaurantes",
        marketing_tax: 180,
        admin_tax: 170,
        market_place_tax: 160,
        benefits_name: ['Vale Refeição', 'Vale Alimentação']
      },

      {
        name: "Alimentação",
        marketing_tax: 200,
        admin_tax: 250,
        market_place_tax: 220,
        benefits_name: ['Vale Refeição', 'Vale Alimentação']
      }
    ]


    const branches = await request(app)
      .post(`/branch`)
      .set('Authorization', `Bearer ${correctAdminToken}`)
      .send(branchesByName);
    branch1_uuid = branches.body[0].uuid
    branch2_uuid = branches.body[1].uuid
    branch3_uuid = branches.body[2].uuid
    branch4_uuid = branches.body[3].uuid
    branch5_uuid = branches.body[4].uuid

    //create business info 1
    const input = {
      line1: "Rua",
      line2: "72B",
      line3: "",
      neighborhood: "Bairro Teste",
      postal_code: "5484248423",
      city: "Cidade teste",
      state: "Estado teste",
      country: "País teste",
      fantasy_name: "Empresa teste",
      document: "empregador",
      classification: "Classificação",
      colaborators_number: 5,
      email: "empregador@empregador.com",
      phone_1: "215745158",
      phone_2: "124588965",
      business_type: "empregador",
      employer_branch: "Frigoríficio",
      items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid]
    }

    const businessInfo = await request(app).post("/business/register").send(input)
    employer_info_uuid = businessInfo.body.business_info_uuid

    //create business info 2
    const input2 = {
      line1: "Rua",
      line2: "72B",
      line3: "",
      neighborhood: "Bairro Teste",
      postal_code: "5484248423",
      city: "Cidade teste",
      state: "Estado teste",
      country: "País teste",
      fantasy_name: "Empresa teste",
      document: "empregador2",
      classification: "Classificação",
      colaborators_number: 5,
      email: "empregador2@empregador.com",
      phone_1: "215745158",
      phone_2: "124588965",
      business_type: "empregador",
      employer_branch: "Frigoríficio",
      items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid]
    }

    const businessInfo2 = await request(app).post("/business/register").send(input2)

    employer_info_uuid2 = businessInfo2.body.business_info_uuid

    //create business info 3
    const input3 = {
      line1: "Rua",
      line2: "72B",
      line3: "",
      neighborhood: "Bairro Teste",
      postal_code: "5484248423",
      city: "Cidade teste",
      state: "Estado teste",
      country: "País teste",
      fantasy_name: "Empresa teste",
      document: "empregador3",
      classification: "Classificação",
      colaborators_number: 5,
      email: "empregador3@empregador.com",
      phone_1: "215745158",
      phone_2: "124588965",
      business_type: "empregador",
      employer_branch: "Frigoríficio",
      items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid]
    }

    const businessInfo3 = await request(app).post("/business/register").send(input3)

    employer_info_uuid3 = businessInfo3.body.business_info_uuid



  })
  describe("E2E App User Auth", () => {

    describe("Create app user", () => {
      it("Should throw an error if document is invalid", async () => {
        const inputNewAppUser12: InputCreateAppUserDTO = {
          user_info_uuid: null,
          document: '112346440535454',
          email: 'email@email.com',
          password: 'senha123',
          is_active: true
        }
        const user2 = await request(app).post("/app-user").send(inputNewAppUser12)

        expect(user2.statusCode).toBe(400)
        expect(user2.body.error).toEqual(`Document must have 11 characters: ${inputNewAppUser12.document}`)

      })
      it("Should throw an error if email is invalid", async () => {
        const inputNewAppUser12: InputCreateAppUserDTO = {
          user_info_uuid: null,
          document: documentUser1,
          email: 'email.com',
          password: 'senha123',
          is_active: true
        }
        const user2 = await request(app).post("/app-user").send(inputNewAppUser12)

        expect(user2.statusCode).toBe(400)
        expect(user2.body.error).toEqual("Invalid email format")

      })


      it("Should create a new app user", async () => {

        const result = await request(app).post("/app-user").send(inputNewAppUser1)

        expect(result.statusCode).toBe(201)
        expect(result.body.document).toEqual("87548876076")
        expect(result.body.email).toEqual(inputNewAppUser1.email)
        expect(result.body.is_active).toEqual(inputNewAppUser1.is_active)

      })
      it("Should throw an error if document is already registered", async () => {
        const inputNewAppUser12: InputCreateAppUserDTO = {
          user_info_uuid: null,
          document: documentUser1,
          email: 'email@email.com',
          password: 'senha123',
          is_active: true
        }
        const user2 = await request(app).post("/app-user").send(inputNewAppUser12)

        expect(user2.statusCode).toBe(409)
        expect(user2.body.error).toEqual("User already has an account")

      })


      it("Should throw an error if email is already registered", async () => {
        const inputNewAppUser12: InputCreateAppUserDTO = {
          user_info_uuid: null,
          document: '40353978060',
          email: 'email@email.com',
          password: 'senha123',
          is_active: true
        }
        const user2 = await request(app).post("/app-user").send(inputNewAppUser12)

        expect(user2.statusCode).toBe(409)
        expect(user2.body.error).toEqual("Email already in use")

      })
    })

    describe("Login App user", () => {

      it("Should throw an error if document is missing ", async () => {
        const result = await request(app).post("/login-app-user").send({
          document: '',
          password: 'password'
        })
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Document/password is incorrect")
      })

      it("Should throw an error if password is missing ", async () => {
        const result = await request(app).post("/login-app-user").send({
          document: 'document',
          password: ''
        })

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Document/password is incorrect")
      })


      it("Should throw an error if document is not found ", async () => {
        const result = await request(app).post("/login-app-user").send({
          document: '40353978060',
          password: inputNewAppUser1.password
        })
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Document/password is incorrect")
      })

      it("Should throw an error if password is incorrect ", async () => {
        const result = await request(app).post("/login-app-user").send({
          document: inputNewAppUser1.document,
          password: 'inputNewAppUser1.password'
        })
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Document/password is incorrect")
      })

      it("Should login app user with only number document", async () => {
        const result = await request(app).post("/login-app-user").send(authenticateAppUser1)

        userToken1 = result.body.token
        expect(result.statusCode).toBe(200)
      })
      it("Should login app user with full document", async () => {
        const input = {
          document: "875.488.760-76",
          password: authenticateAppUser1.password
        }

        const result = await request(app).post("/login-app-user").send(input)
        userToken1 = result.body.token
        expect(result.statusCode).toBe(200)
      })
    })

    describe("App user details", () => {

      it("Should throw an error if token is missing", async () => {

        const result = await request(app).get("/app-user")

        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Token is missing")
      })

      it("Should return only user auth", async () => {

        const result = await request(app)
          .get("/app-user")
          .set('Authorization', `Bearer ${userToken1}`)

        expect(result.statusCode).toBe(200)
        expect(result.body.status).toBeFalsy()
        expect(result.body.UserAuthDetails.document).toEqual("87548876076")
        expect(result.body.UserAuthDetails.email).toEqual(inputNewAppUser1.email)
        expect(result.body.UserInfo).toBeFalsy()
        expect(result.body.UserAddress).toBeFalsy()
        expect(result.body.UserValidation).toBeFalsy()
      })



    })
  })

  describe("E2E tests App User Info by user", () => {
    describe("Create App User Info by user", () => {
      it("Should create a new user info", async () => {

        const input: any = {
          business_info_uuid: null,
          address_uuid: null,
          document: null,
          document2: '24875492',
          document3: '56121561258',
          full_name: "User Full Name",
          display_name: null,
          internal_company_code: '54891218',
          gender: 'Masculino',
          date_of_birth: '15/08/1998',
          salary: 2000,
          phone: '679654874520',
          email: null,
          company_owner: false,
          status: null,
          function: null,
          recommendation_code: '514554156',
          is_authenticated: false,
          marital_status: 'casado',
          dependents_quantity: 1,
          user_document_validation_uuid: null,
        }


        const result = await request(app).post("/app-user/info").set('Authorization', `Bearer ${userToken1}`).send(input)
        const userDetails = await request(app)
          .get("/app-user")
          .set('Authorization', `Bearer ${userToken1}`)

        //get user info to confirm
        const getUserInfo = await request(app).get("/app-user/info").set('Authorization', `Bearer ${userToken1}`)
        expect(getUserInfo.statusCode).toBe(200)


        expect(result.statusCode).toBe(201)
        expect(result.body.sucess).toEqual("User info registered successfully")
        expect(userDetails.body.UserInfo).toBeTruthy()
        expect(getUserInfo.body.document).toEqual('87548876076')
        expect(getUserInfo.body.document2).toEqual('24875492')
        expect(getUserInfo.body.document3).toEqual('56121561258')
        expect(getUserInfo.body.full_name).toEqual("User Full Name")
        expect(getUserInfo.body.gender).toEqual("Masculino")
        expect(getUserInfo.body.date_of_birth).toEqual("15/08/1998")
        expect(getUserInfo.body.phone).toEqual("679654874520")

      })
      it("Should throw an error if user info is already registered and tables are already synchronized", async () => {

        const input: InputCreateUserInfoDTO = {
          business_info_uuid: null,
          address_uuid: null,
          document: null,
          document2: null,
          document3: null,
          full_name: "User Full Name",
          display_name: null,
          internal_company_code: null,
          gender: 'Male',
          date_of_birth: '15/08/1998',
          salary: null,
          phone: null,
          email: "email@email.com",
          company_owner: false,
          status: null,
          function: null,
          recommendation_code: null,
          is_authenticated: false,
          marital_status: null,
          dependents_quantity: 1,
          user_document_validation_uuid: null,
          user_id: null
        }

        const createUser = await request(app).post("/app-user/info").set('Authorization', `Bearer ${userToken1}`).send(input)


        expect(createUser.body.error).toBe("User Info already registered - 1")
        expect(createUser.statusCode).toBe(409)
      })

      it("Should throw an error if user info is already registered and tables are not synchronized", async () => {
        //IMPORTANT: This test will happen when correct admin registers user info before user downloads the app.
        //When the user registers itself in userAuth table, the api will check if correct admin already created user info and will synchronize tables.
        //this test still need to be created


        // const inputNewAppUser1: InputCreateAppUserDTO = {
        //     user_info_uuid: null,
        //     document: '329.552.380-07',
        //     email: 'new-user@new-user.com',
        //     password: 'senha123',
        //     is_active: true
        // }
        // //create new user auth
        //  await request(app).post("/app-user").send(inputNewAppUser1)

        // //login user
        // const userLogin = {
        //     document: inputNewAppUser1.document,
        //     password: inputNewAppUser1.password
        // }
        // const loginUser = await request(app).post("/login-app-user").send(userLogin)
        // const userToken1New = loginUser.body.token

        // const input: InputCreateUserInfoDTO = {
        //     business_info_uuid: null,
        //     address_uuid: null,
        //     document: documentUser1,
        //     document2: null,
        //     document3: null,
        //     full_name: "User Full Name",
        //     display_name: null,
        //     internal_company_code: null,
        //     gender: 'Male',
        //     date_of_birth: '15/08/1998',
        //     salary: null,
        //     phone: null,
        //     email: "email@email.com",
        //     company_owner: false,
        //     status: null,
        //     function: null,
        //     recommendation_code: null,
        //     is_authenticated: false,
        //     marital_status: null,
        //     dependents_quantity: 1,
        //     user_document_validation_uuid: null,
        //     user_id: null
        // }


        // const createUser = await request(app).post("/app-user/info").set('Authorization', `Bearer ${userToken1}`).send(input)


        // expect(createUser.body.error).toBe("User Info already registered - 1")
        // expect(createUser.statusCode).toBe(409)
      })

    })

    describe("Get User Info By User", () => {

      it("Should return user info", async () => {

        const result = await request(app).get("/app-user/info").set('Authorization', `Bearer ${userToken1}`)
        expect(result.body).toHaveProperty("uuid")

      })
    })


  })
  describe("E2E tests User Address", () => {
    describe("Create app user address", () => {
      it("Should throw an error if line 1 is missing", async () => {
        const input = {
          line1: "",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",
        }

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input)

        expect(result.body.error).toBe("Line1 is required")
        expect(result.statusCode).toBe(400)
      })
      it("Should throw an error if line 2 is missing", async () => {
        const input = {
          line1: "Rua teste",
          line2: "",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        }

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input)

        expect(result.body.error).toBe("Line2 is required")
        expect(result.statusCode).toBe(400)
      })

      it("Should throw an error if postal code is missing", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        }


        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input)

        expect(result.body.error).toBe("Postal code is required")
        expect(result.statusCode).toBe(400)
      })

      it("Should throw an error if postal code is missing", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        }

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input)

        expect(result.body.error).toBe("Neighborhood is required")
        expect(result.statusCode).toBe(400)
      })

      it("Should throw an error if city is missing", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "",
          state: "Estado teste",
          country: "País",

        }

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input)

        expect(result.body.error).toBe("City is required")
        expect(result.statusCode).toBe(400)
      })

      it("Should throw an error if state is missing", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "",
          country: "País",

        }

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input)

        expect(result.body.error).toBe("State is required")
        expect(result.statusCode).toBe(400)
      })

      it("Should throw an error if country is missing", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "",

        }

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input)

        expect(result.body.error).toBe("Country is required")
        expect(result.statusCode).toBe(400)
      })

      it("Should throw an error if line 1 is not a string", async () => {
        const input = {
          line1: 123,
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("Line1 must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should throw an error if line 2 is not a string", async () => {
        const input = {
          line1: "Rua teste",
          line2: 123,
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("Line2 must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should throw an error if line 3 is not a string", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: 123,
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("Line3 must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should throw an error if postal code is not a string", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: 123456,
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("Postal code must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should throw an error if neighborhood is not a string", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: 123,
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("Neighborhood must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should throw an error if city is not a string", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: 123,
          state: "Estado teste",
          country: "País",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("City must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should throw an error if state is not a string", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: 123,
          country: "País",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("State must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should throw an error if country is not a string", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: 123,

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("Country must be a string");
        expect(result.statusCode).toBe(400);
      });

      it("Should create a new user address", async () => {
        const input = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "Brasil",

        };

        const result = await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);
        const inputUserInfo = {
          document: documentUser1,
        }


        const userInfo = await request(app).get("/app-user/info").set('Authorization', `Bearer ${userToken1}`).send(inputUserInfo)
        expect(result.statusCode).toBe(201);
        expect(result.body.line1).toEqual(input.line1)
        expect(result.body.line2).toEqual(input.line2)
        expect(result.body.line3).toEqual(input.line3)
        expect(result.body.postal_code).toEqual(input.postal_code)
        expect(result.body.neighborhood).toEqual(input.neighborhood)
        expect(result.body.city).toEqual(input.city)
        expect(result.body.state).toEqual(input.state)
        expect(result.body.country).toEqual(input.country)
        expect(result.body.uuid).toEqual(userInfo.body.address_uuid)
      });
    })

    describe("Get User address", () => {
      it("Should throw an error if user document is missing", async () => {
        const input = {
          document: ''
        }
        const result = await request(app).get("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("User document is required")
        expect(result.statusCode).toBe(400);

      })

      it("Should throw an error if user cannot be found by document", async () => {
        const input = {
          document: '321564894518'
        }
        const result = await request(app).get("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(input);

        expect(result.body.error).toBe("Unable to find user by document")
        expect(result.statusCode).toBe(404);

      })
      it("Should throw an error if address does not exist", async () => {
        const inputOtherUser: InputCreateAppUserDTO = {
          user_info_uuid: null,
          document: '630.996.530-12',
          email: 'email-new@email.com',
          password: 'senha123',
          is_active: true
        }

        const inputLoginUser = {
          document: inputOtherUser.document,
          password: inputOtherUser.password,
        }

        const inputCreateUserInfo: InputCreateUserInfoDTO = {
          business_info_uuid: null,
          address_uuid: null,
          document: '630.996.530-12',
          document2: null,
          document3: null,
          full_name: "User Full Name",
          display_name: null,
          internal_company_code: null,
          gender: 'Male',
          date_of_birth: '15/08/1998',
          salary: null,
          phone: null,
          email: "email-new@email.com",
          company_owner: false,
          status: null,
          function: null,
          recommendation_code: null,
          is_authenticated: false,
          marital_status: null,
          dependents_quantity: 1,
          user_document_validation_uuid: null,
          user_id: null
        }

        const inputGetUserAddress = {
          document: inputCreateUserInfo.document
        }

        //create new User
        const otherUser = await request(app).post("/app-user").send(inputOtherUser)
        //login user
        const loginUser = await request(app).post("/login-app-user").send(inputLoginUser)
        const newuserToken1 = loginUser.body.token

        //create user info
        await request(app).post("/app-user/info").set('Authorization', `Bearer ${newuserToken1}`).send(inputCreateUserInfo)
        //find address
        const result = await request(app).get("/app-user/address").set('Authorization', `Bearer ${newuserToken1}`).send(inputGetUserAddress);

        expect(result.body.error).toBe("Unable to find user address")
        expect(result.statusCode).toBe(404);

      })

      it("Should return user Address", async () => {
        const inputUserAddress = {
          document: documentUser1,
        }


        const result = await request(app).get("/app-user/address").set('Authorization', `Bearer ${userToken1}`).send(inputUserAddress);

        expect(result.statusCode).toBe(200);
        expect(result.body.line1).toBe("Rua teste")
        expect(result.body.line2).toBe("41B")
        expect(result.body.line3).toBeFalsy()
        expect(result.body.postal_code).toBe("02457-458")
        expect(result.body.neighborhood).toBe("Bairro Teste")
        expect(result.body.city).toBe("Cidade teste")
        expect(result.body.state).toBe("Estado teste")
        expect(result.body.country).toBe("Brasil")

      })
    })

    describe("Update user address", () => {

      it("Should throw an error if user info is not found", async () => {

        const inputAppUser: InputCreateAppUserDTO = {
          user_info_uuid: null,
          document: '777.690.850-98',
          email: 'email-test2@email.com',
          password: 'senha123',
          is_active: true
        }

        const inputLoginUser = {
          document: inputAppUser.document,
          password: inputAppUser.password
        }

        const inputAddress: InputUpdateAppUserAddressDTO = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",
          user_uuid: new Uuid("8c47d070-d708-4eb3-a981-f5fb69184c74")
        }

        //create appuser
        await request(app).post("/app-user").send(inputAppUser)

        //login user
        const token = await request(app).post("/login-app-user").send(inputLoginUser)
        userToken2 = token.body.token

        const result = await request(app).put("/app-user/address").set('Authorization', `Bearer ${userToken2}`).send(inputAddress)

        expect(result.body.error).toBe("User info not found")
        expect(result.statusCode).toBe(404)
      })

      it("Should throw an error if address FK is null", async () => {


        const inputCreateUserInfo: InputCreateUserInfoDTO = {
          business_info_uuid: null,
          address_uuid: null,
          document: '630.996.530-12',
          document2: null,
          document3: null,
          full_name: "User Full Name",
          display_name: null,
          internal_company_code: null,
          gender: 'Male',
          date_of_birth: '15/08/1998',
          salary: null,
          phone: null,
          email: "email-new@email.com",
          company_owner: false,
          status: null,
          function: null,
          recommendation_code: null,
          is_authenticated: false,
          marital_status: null,
          dependents_quantity: 1,
          user_document_validation_uuid: null,
          user_id: null
        }
        const inputAddress: InputUpdateAppUserAddressDTO = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",
          user_uuid: new Uuid("8c47d070-d708-4eb3-a981-f5fb69184c74")
        }


        //create user info
        await request(app).post("/app-user/info").set('Authorization', `Bearer ${userToken2}`).send(inputCreateUserInfo)

        const result = await request(app).put("/app-user/address").set('Authorization', `Bearer ${userToken2}`).send(inputAddress)

        expect(result.body.error).toBe("User address not found")
        expect(result.statusCode).toBe(404)

      })

      it("Should throw an error if user address is not found", async () => {
        const inputCreateUserInfo: InputCreateUserInfoDTO = {
          business_info_uuid: null,
          address_uuid: new Uuid("8c47d070-d708-4eb3-a981-f5fb69184c74"),
          document: '630.996.530-12',
          document2: null,
          document3: null,
          full_name: "User Full Name",
          display_name: null,
          internal_company_code: null,
          gender: 'Male',
          date_of_birth: '15/08/1998',
          salary: null,
          phone: null,
          email: "email-new@email.com",
          company_owner: false,
          status: null,
          function: null,
          recommendation_code: null,
          is_authenticated: false,
          marital_status: null,
          dependents_quantity: 1,
          user_document_validation_uuid: null,
          user_id: null
        }
        const inputAddress: InputUpdateAppUserAddressDTO = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",
          user_uuid: new Uuid("8c47d070-d708-4eb3-a981-f5fb69184c74")
        }


        //create user info
        await request(app).post("/app-user/info").set('Authorization', `Bearer ${userToken2}`).send(inputCreateUserInfo)

        const result = await request(app).put("/app-user/address").set('Authorization', `Bearer ${userToken2}`).send(inputAddress)

        expect(result.body.error).toBe("User address not found")
        expect(result.statusCode).toBe(404)

      })

      it("Should create user address", async () => {

        const inputAppUser: InputCreateAppUserDTO = {
          user_info_uuid: null,
          document: '777.690.850-98',
          email: 'email-test2@email.com',
          password: 'senha123',
          is_active: true
        }

        const inputCreateUserInfo: InputCreateUserInfoDTO = {
          business_info_uuid: null,
          address_uuid: new Uuid("8c47d070-d708-4eb3-a981-f5fb69184c74"),
          document: '630.996.530-12',
          document2: null,
          document3: null,
          full_name: "User Full Name",
          display_name: null,
          internal_company_code: null,
          gender: 'Male',
          date_of_birth: '15/08/1998',
          salary: null,
          phone: null,
          email: "email-new@email.com",
          company_owner: false,
          status: null,
          function: null,
          recommendation_code: null,
          is_authenticated: false,
          marital_status: null,
          dependents_quantity: 1,
          user_document_validation_uuid: null,
          user_id: null
        }

        const inputCreateAddress = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste",
          city: "Cidade teste",
          state: "Estado teste",
          country: "Brasil",

        };

        await request(app).post("/app-user/address").set('Authorization', `Bearer ${userToken2}`).send(inputCreateAddress);

        const inputUpdateAddress: InputUpdateAppUserAddressDTO = {
          line1: "Rua teste",
          line2: "41B",
          line3: "",
          postal_code: "02457-458",
          neighborhood: "Bairro Teste Novo",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País",
          user_uuid: new Uuid("8c47d070-d708-4eb3-a981-f5fb69184c74")
        }

        //create appuser
        await request(app).post("/app-user").send(inputAppUser)

        //create user info
        await request(app).post("/app-user/info").set('Authorization', `Bearer ${userToken2}`).send(inputCreateUserInfo)

        const result = await request(app).put("/app-user/address").set('Authorization', `Bearer ${userToken2}`).send(inputUpdateAddress)

        expect(result.body.line1).toEqual(inputUpdateAddress.line1)
        expect(result.body.line2).toEqual(inputUpdateAddress.line2)
        expect(result.body.line3).toEqual(inputUpdateAddress.line3)
        expect(result.body.postal_code).toEqual(inputUpdateAddress.postal_code)
        expect(result.body.neighborhood).toEqual(inputUpdateAddress.neighborhood)
        expect(result.body.city).toEqual(inputUpdateAddress.city)
        expect(result.body.state).toEqual(inputUpdateAddress.state)
        expect(result.body.country).toEqual(inputUpdateAddress.country)

      })
    })
  })

  describe("E2E tests Document Validation", () => {
    describe("Create document validation", () => {
      it("Should throw and error if user info is not found", async () => {
        //create user2
        await request(app).post("/app-user").send(inputNewAppUser2)
        //login user 2
        const token = await request(app).post("/login-app-user").send(authenticateAppUser2)
        userToken3 = token.body.token

        const input = {
          selfie_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
          document_front_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
          document_back_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
          document_selfie_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
        };

        const result = await request(app).post("/app-user/document-validation").set('Authorization', `Bearer ${userToken3}`).send(input)

        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("User info not found")
      })

      it("Should throw an error if any document was not sent", async () => {
        //create user2
        await request(app).post("/app-user").send(inputNewAppUser2)

        //login user 2
        const token = await request(app).post("/login-app-user").send(authenticateAppUser2)
        userToken3 = token.body.token

        //create user info
        const inputCreateUserInfo: InputCreateUserInfoDTO = {
          business_info_uuid: null,
          address_uuid: null,
          document: inputNewAppUser2.document,
          document2: null,
          document3: null,
          full_name: "User Full Name",
          display_name: null,
          internal_company_code: null,
          gender: 'Male',
          date_of_birth: '15/08/1998',
          salary: null,
          phone: null,
          email: inputNewAppUser2.email,
          company_owner: false,
          status: null,
          function: null,
          recommendation_code: null,
          is_authenticated: false,
          marital_status: null,
          dependents_quantity: 1,
          user_document_validation_uuid: null,
          user_id: null
        }

        //create user info
        await request(app).post("/app-user/info").set('Authorization', `Bearer ${userToken3}`).send(inputCreateUserInfo)

        const input = {
          selfie_base64: '',
          document_front_base64: '',
          document_back_base64: '',
          document_selfie_base64: '',
        };

        const result = await request(app).post("/app-user/document-validation").set('Authorization', `Bearer ${userToken3}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("No documents to be registered")
      })

      it("Should register one document", async () => {
        //create user2
        await request(app).post("/app-user").send(inputNewAppUser2)
        //login user 2
        const token = await request(app).post("/login-app-user").send(authenticateAppUser2)
        userToken3 = token.body.token

        const input = {
          selfie_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
          document_front_base64: '',
          document_back_base64: '',
          document_selfie_base64: '',
        };

        const result = await request(app).post("/app-user/document-validation").set('Authorization', `Bearer ${userToken3}`).send(input)

        expect(result.statusCode).toBe(201)
        expect(result.body.result.selfie_status).toBe("under_analysis")
      })

      it("Should update documents", async () => {
        //create user2
        await request(app).post("/app-user").send(inputNewAppUser2)
        //login user 2
        const token = await request(app).post("/login-app-user").send(authenticateAppUser2)
        userToken3 = token.body.token

        const input = {
          selfie_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
          document_front_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
          document_back_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
          document_selfie_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
        };

        const result = await request(app).post("/app-user/document-validation").set('Authorization', `Bearer ${userToken3}`).send(input)

        expect(result.statusCode).toBe(201)
        expect(result.body.result.selfie_status).toBe("under_analysis")
        expect(result.body.result.document_front_status).toBe("under_analysis")
        expect(result.body.result.document_back_status).toBe("under_analysis")
        expect(result.body.result.document_selfie_status).toBe("under_analysis")
      })
    })
  })

  describe("E2E tests User Status by document - Not authenticated", () => {
    it("Should return user with only user auth registered", async () => {

      //create app user
      await request(app).post("/app-user").send(inputNewAppUser3)

      const result = await request(app)
        .get(`/app-user/document/${inputNewAppUser3.document}`)

      expect(result.body.status).toBeFalsy()
      expect(result.body.UserAuth).toBeTruthy()
      expect(result.body.UserInfo).toBeFalsy()
      expect(result.body.Address).toBeFalsy()
      expect(result.body.UserValidation.document_front_status).toBe("pending to send")
      expect(result.body.UserValidation.document_back_status).toBe("pending to send")
      expect(result.body.UserValidation.document_selfie_status).toBe("pending to send")
      expect(result.body.UserValidation.selfie_status).toBe("pending to send")

    })

    it("Should return user with user auth and user info registered", async () => {

      const result = await request(app)
        .get(`/app-user/document/${inputNewAppUser2.document}`)

      expect(result.body.status).toBeFalsy()
      expect(result.body.UserAuth).toBeTruthy()
      expect(result.body.UserInfo).toBeTruthy()
      expect(result.body.Address).toBeFalsy()
      expect(result.body.UserValidation.document_front_status).toBe("pending to send")
      expect(result.body.UserValidation.document_back_status).toBe("pending to send")
      expect(result.body.UserValidation.document_selfie_status).toBe("pending to send")
      expect(result.body.UserValidation.selfie_status).toBe("pending to send")

    })


    it("Should return user with user auth, user info, and address registered", async () => {

      const result = await request(app)
        .get(`/app-user/document/${inputNewAppUser1.document}`)

      expect(result.body.status).toBeFalsy()
      expect(result.body.UserAuth).toBeTruthy()
      expect(result.body.UserInfo).toBeTruthy()
      expect(result.body.Address).toBeTruthy()
      expect(result.body.UserValidation.document_front_status).toBe("pending to send")
      expect(result.body.UserValidation.document_back_status).toBe("pending to send")
      expect(result.body.UserValidation.document_selfie_status).toBe("pending to send")
      expect(result.body.UserValidation.selfie_status).toBe("pending to send")

    })


    it("Should return a user with full status", async () => {

      const token = await request(app).post("/login-app-user").send(authenticateAppUser1)
      const userToken = token.body.token
      const input = {
        selfie_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
        document_front_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
        document_back_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
        document_selfie_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
      };

      await request(app).post("/app-user/document-validation").set('Authorization', `Bearer ${userToken}`).send(input)

      const result = await request(app)
        .get(`/app-user/document/${inputNewAppUser1.document}`)

      expect(result.body.status).toBeTruthy()
      expect(result.body.UserAuth).toBeTruthy()
      expect(result.body.UserInfo).toBeTruthy()
      expect(result.body.Address).toBeTruthy()
      expect(result.body.UserValidation.document_front_status).toBe("under_analysis")
      expect(result.body.UserValidation.document_back_status).toBe("under_analysis")
      expect(result.body.UserValidation.document_selfie_status).toBe("under_analysis")
      expect(result.body.UserValidation.selfie_status).toBe("under_analysis")

    })
  })

  describe("E2E tests Upload csv to register users by correct", () => {

    beforeAll(async () => {
      //create employee 1
      const onlyUserAuth: InputCreateAppUserDTO = {
        user_info_uuid: null,
        document: '350.707.670-54',
        email: 'only_auth@email.com',
        password: 'senha123',
        is_active: true
      }
      await request(app).post("/app-user").send(onlyUserAuth)
      const input = {
        document: onlyUserAuth.document,
        password: onlyUserAuth.password
      }

      const userAuthResponse = await request(app).post("/login-app-user").send(input)
      employeeAuthToken = userAuthResponse.body.token


      //activate business 1
      const inputToActivate = {
        address_uuid: business_address_uuid,
        fantasy_name: "Empresa novo nome",
        document: "empregador",
        classification: "Classificação",
        colaborators_number: 5,
        email: "empregador@empregador.com",
        phone_1: "215745158",
        phone_2: "124588965",
        business_type: "empregador",
        status: "active"
      }
      const query = {
        business_info_uuid: employer_info_uuid
      }
      const activateBusiness1 = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToActivate)
      expect(activateBusiness1.statusCode).toBe(200)

      //create employer user 1
      const inputEmployer = {
        password: "123456",
        business_info_uuid: employer_info_uuid,
        email: "empregador@empregador.com"
      }
      const createEmployer = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(inputEmployer)
      employer_user_uuid = createEmployer.body.uuid
      expect(createEmployer.statusCode).toBe(201)


      //authenticate employer user 1
      const authInput = {
        business_document: "empregador",
        password: "123456",
        email: "empregador@empregador.com"
      }

      const auth = await request(app).post("/business/admin/login").send(authInput)
      expect(auth.statusCode).toBe(200)
      employer_user_token = auth.body.token



      const csvFilePath = path.join(__dirname, '../../../test-files/ideal-model.csv');
      const result = await request(app)
        .post('/app-users-by-correct')
        .query(query)
        .set('Authorization', `Bearer ${correctAdminToken}`)
        .attach('file', csvFilePath)

      //user details
      const onlyUserAuthDetails = await request(app)
        .get("/app-user")
        .set('Authorization', `Bearer ${employeeAuthToken}`)

      const findUser = await request(app).get("/app-user/info").set('Authorization', `Bearer ${employeeAuthToken}`)

      employee_user_info = findUser.body.uuid
      expect(onlyUserAuthDetails.body.UserAuthDetails.user_info_uuid).toBe(findUser.body.uuid)
      expect(result.statusCode).toBe(200);
      expect(result.body.usersRegistered.length).toBe(15)
      expect(result.body.errorUser.length).toBe(0)
    });

    it("Should throw an error if business id is missing", async () => {
      const csvFilePath = path.join(__dirname, '../../../test-files/ideal-model.csv');

      const query = {
        business_info_id: ''
      }

      const result = await request(app)
        .post('/app-users-by-correct')
        .query(query)
        .set('Authorization', `Bearer ${correctAdminToken}`)
        .attach('file', csvFilePath) // 'file' deve corresponder ao nome do campo esperado no endpoint

      // Verifique o status da resposta e outras condições esperadas
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toBe('Business Id is required');

    });
    it("Should throw an error if business is not found", async () => {
      const csvFilePath = path.join(__dirname, '../../../test-files/ideal-model.csv');

      const query = {
        business_info_uuid: '1'
      }

      const result = await request(app)
        .post('/app-users-by-correct')
        .query(query)
        .set('Authorization', `Bearer ${correctAdminToken}`)
        .attach('file', csvFilePath) // 'file' deve corresponder ao nome do campo esperado no endpoint

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toBe('Business not found');

    });

    it("Should throw an error if business is not active", async () => {
      const csvFilePath = path.join(__dirname, '../../../test-files/ideal-model.csv');

      const query = {
        business_info_uuid: employer_info_uuid2
      }

      const result = await request(app)
        .post('/app-users-by-correct')
        .query(query)
        .set('Authorization', `Bearer ${correctAdminToken}`)
        .attach('file', csvFilePath) // 'file' deve corresponder ao nome do campo esperado no endpoint

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toBe('Business must be activated');

    });
    it("Should throw an error if file is not sent", async () => {

      const query = {
        business_info_uuid: employer_info_uuid
      }

      const result = await request(app)
        .post('/app-users-by-correct')
        .query(query)
        .set('Authorization', `Bearer ${correctAdminToken}`)


      expect(result.statusCode).toBe(400);
      expect(result.body.error).toBe('Error upload file');

    });
    it("Should register users from csv", async () => {

      const csvFilePath = path.join(__dirname, '../../../test-files/ideal-model.csv');

      const query = {
        business_info_uuid: employer_info_uuid
      }

      const result = await request(app)
        .post('/app-users-by-correct')
        .query(query)
        .set('Authorization', `Bearer ${correctAdminToken}`)
        .attach('file', csvFilePath) //

      //get list of employees to confifm
      const employeesList = await request(app).get("/business-admin/app-users").set('Authorization', `Bearer ${employer_user_token}`)


      expect(result.statusCode).toBe(200)
      expect(result.statusCode).toBe(200);
      expect(result.body.usersRegistered.length).toBe(15)
      expect(employeesList.body.length).toBe(15)
    });

    it("Should register associated users from csv", async () => {
      //activate employer 2
      const inputToActivate = {
        address_uuid: business_address_uuid,
        fantasy_name: "Empresa novo nome 2",
        document: "empregador2",
        classification: "Classificação",
        colaborators_number: 5,
        email: "empregador2@empregador.com",
        phone_1: "215745158",
        phone_2: "124588965",
        business_type: "empregador",
        status: "active"
      }
      const queryActivate = {
        business_info_uuid: employer_info_uuid2
      }
      const activateEmployerr2 = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(queryActivate).send(inputToActivate)
      expect(activateEmployerr2.statusCode).toBe(200)


      //create employer user 2
      const inputEmployer2 = {
        password: "123456",
        business_info_uuid: employer_info_uuid2,
        email: "empregador2@empregador.com"
      }
      const createEmployer2 = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(inputEmployer2)
      employer_user_uuid2 = createEmployer2.body.uuid
      expect(createEmployer2.statusCode).toBe(201)


      //authenticate employer user 2
      const authInput2 = {
        business_document: "empregador2",
        password: "123456",
        email: "empregador2@empregador.com"
      }

      const auth = await request(app).post("/business/admin/login").send(authInput2)
      expect(auth.statusCode).toBe(200)
      employer_user_token2 = auth.body.token


      //Start test here
      const csvFilePath = path.join(__dirname, '../../../test-files/ideal-model.csv');

      const query = {
        business_info_uuid: employer_info_uuid2
      }

      const result = await request(app)
        .post('/app-users-by-correct')
        .query(query)
        .set('Authorization', `Bearer ${correctAdminToken}`)
        .attach('file', csvFilePath) //

      //get list of employees to confifm
      const employeesList2 = await request(app).get("/business-admin/app-users").set('Authorization', `Bearer ${employer_user_token2}`)
      const employeesList = await request(app).get("/business-admin/app-users").set('Authorization', `Bearer ${employer_user_token}`)


      expect(result.statusCode).toBe(200)
      expect(result.statusCode).toBe(200);
      expect(employeesList.body).toEqual(employeesList2.body)
      expect(result.body.associatedUsers.length).toBe(15)

    })

  })

  describe("E2E tests create already registered user by correct", () => {
    it("Should register an user auth", async () => {
      //Create an userauth
      const input = {
        email: 'alreadyregistered@email.com',
        password: 'senha123',
        document: '40650089057' //Este CPF está no modelo de arquivo csv. Utilizar ele indica que este cpf já possui userInfo registrado pela Correct
      }
      await request(app).post("/app-user").send(input)

      //authenticate user auth details
      const authInput = {
        document: input.document,
        password: input.password
      }
      const userAuthResponse = await request(app).post("/login-app-user").send(authInput)
      employeeAuthToken2 = userAuthResponse.body.token

      //get userAuth details
      const userAuthDetails = await request(app)
        .get("/app-user")
        .set('Authorization', `Bearer ${employeeAuthToken2}`)

      //get userInfo
      const userInfoDetails = await request(app).get("/app-user/info").set('Authorization', `Bearer ${employeeAuthToken2}`).send(input)
      expect(userAuthDetails.body.status).toBeFalsy()
      expect(userAuthDetails.body.UserAuthDetails.user_info_uuid).toBe(userInfoDetails.body.uuid)
      expect(userAuthDetails.body.UserInfo).toBeTruthy()
      expect(userAuthDetails.body.UserAddress).toBeFalsy()
      expect(userAuthDetails.body.UserValidation).toBeFalsy()

    })
  })
  describe("Employee By Employer", () => {
    beforeAll(async () => {
      //activate business 3
      const inputToActivate3 = {
        address_uuid: business_address_uuid,
        fantasy_name: "Empresa novo nome 3",
        document: "empregador3",
        classification: "Classificação",
        colaborators_number: 5,
        email: "empregador3@empregador.com",
        phone_1: "215745158",
        phone_2: "124588965",
        business_type: "empregador",
        status: "active"
      }
      const query = {
        business_info_uuid: employer_info_uuid3
      }
      const activateBusiness3 = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToActivate3)
      expect(activateBusiness3.statusCode).toBe(200)

      //create employer user 3
      const inputEmployer3 = {
        password: "123456",
        business_info_uuid: employer_info_uuid,
        email: "empregador3@empregador.com"
      }
      const createEmployer3 = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(inputEmployer3)
      employer_user_uuid3 = createEmployer3.body.uuid
      expect(createEmployer3.statusCode).toBe(201)


      //authenticate employer user 3
      const authInput2 = {
        business_document: "empregador3",
        password: "123456",
        email: "empregador3@empregador.com"
      }

      const auth3 = await request(app).post("/business/admin/login").send(authInput2)
      expect(auth3.statusCode).toBe(200)
      employer_user_token3 = auth3.body.token

    })
    describe("Get All employees by employer", () => {
      beforeAll(async () => {

        //create non employee user auth
        const inputNonEmployee: any = {
          user_info_uuid: null,
          document: '000.458.150-46',
          email: 'non_employee@email.com',
          password: 'senha123'
        }
        const non_employee = await request(app).post("/app-user").send(inputNonEmployee)
        expect(non_employee.statusCode).toBe(201)

        const authNonEmployeeInput = {
          document: inputNonEmployee.document,
          password: inputNonEmployee.password
        }

        //authenticate non employee user
        const auth_non_employe = await request(app).post("/login-app-user").send(authNonEmployeeInput)
        expect(auth_non_employe.statusCode).toBe(200)
        const non_employee_token = auth_non_employe.body.token

        const nonEmployeeUserInput: any = {
          full_name: "User Full Name",
          gender: 'Male',
          date_of_birth: '15/08/1998',
          dependents_quantity: 1
        }

        const userInfoNonEmployee = await request(app).post("/app-user/info").set('Authorization', `Bearer ${non_employee_token}`).send(nonEmployeeUserInput)
        expect(userInfoNonEmployee.statusCode).toBe(201)

        const nonEmployeeUserDetails = await request(app)
          .get("/app-user")
          .set('Authorization', `Bearer ${non_employee_token}`)

        non_employee_user_info = nonEmployeeUserDetails.body.UserAuthDetails.user_info_uuid

        expect(nonEmployeeUserDetails.statusCode).toBe(200)
      })

      it("Should return a list of employees by employer", async () => {

        const result = await request(app).get("/business-admin/app-users").set('Authorization', `Bearer ${employer_user_token2}`)
        expect(result.body.length).toEqual(15)
      })
      it("Should return a empty list of employees by employer", async () => {

        const result = await request(app).get("/business-admin/app-users").set('Authorization', `Bearer ${employer_user_token3}`)
        expect(result.body.length).toBe(0)
      })
    })

    describe("Get single employee by employer", () => {
      it("Should throw an error if employee uuid is missing", async () => {
        const result = await request(app).get("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token}`)
        expect(result.body.error).toBe("Employee uuid is required")
        expect(result.statusCode).toBe(400)
      })

      it("Should throw an error if employee is not found", async () => {
        const result = await request(app).get("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token}`).query({ employeeId: randomUUID() })
        expect(result.body.error).toBe("Employee not found")
        expect(result.statusCode).toBe(404)
      })

      it("Should throw an error if user is not an employee", async () => {
        const result = await request(app).get("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token2}`).query({ employeeId: non_employee_user_info })

        expect(result.body.error).toBe("Unauthorized access")
        expect(result.statusCode).toBe(401)
      })

      it("Should return employee details", async () => {
        const result = await request(app).get("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token}`).query({ employeeId: employee_user_info })

        expect(result.statusCode).toBe(200)
        expect(result.body.uuid).toBe(employee_user_info)
        expect(result.body.business_info_uuid).toBe(employer_info_uuid)
        expect(result.body.document).toBe('35070767054')
      })
    })

    describe("Register single employee by employer", () => {
      it("Should throw an error if document is missing", async () => {
        const result = await request(app).post("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token}`)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Document is required")
      })

      it("Should register a new employee", async () => {
        const input = {
          document: '868.228.050-79',
          full_name: 'João Alves da Silva',
          internal_company_code: '51591348',
          gender:"Masculino",
          function: "Corretor",
          date_of_birth: '14/02/84',
          dependents_quantity: 0
        }


        const result = await request(app).post("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token}`).send(input)
        expect(result.statusCode).toBe(201)
      })

      it("Should register the same employee by a another employer", async () => {
        const input = {
          document: '868.228.050-79',
          full_name: 'João Alves da Silva',
          internal_company_code: '51591348',
          gender:"Masculino",
          function: "Corretor",
          date_of_birth: '14/02/84',
          dependents_quantity: 0
        }


        const result = await request(app).post("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token2}`).send(input)
        expect(result.statusCode).toBe(201)
      })

      it("Should throw an error if user is already an employee", async () => {
        const input = {
          document: '868.228.050-79',
          full_name: 'João Alves da Silva',
          internal_company_code: '51591348',
          gender:"Masculino",
          function: "Corretor",
          date_of_birth: '14/02/84',
          dependents_quantity: 0
        }
        const result = await  request(app).post("/app-user/business-admin").set('Authorization', `Bearer ${employer_user_token2}`).send(input)
        expect(result.statusCode).toBe(409)
        expect(result.body.error).toBe("User with this document already exists for the provided business")
      })

    })
  })
  let pre_paid_user_item_uuid: string
  let post_paid_user_item_uuid: string

  describe("E2E Tests User Items", () => {

    describe("E2E test User items by Employer", () => {
      describe("E2E tests create user item by employer", () => {
        it("Should throw an error if user info id is missing", async () => {
          const input = {
            user_info_uuid: '',
            item_uuid: randomUUID(),
            balance: 1,
            status: 'cancelled' as UserItemStatus,
            business_info_uuid: randomUUID()
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("User Info id is required")
        })
        it("Should throw an error if item id is missing", async () => {
          const input = {
            user_info_uuid: randomUUID(),
            item_uuid: '',
            balance: 1,
            status: 'cancelled' as UserItemStatus,
            business_info_uuid: randomUUID()
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Item id is required")
        })

        it("Should throw an error if balance is negative", async () => {
          const input = {
            user_info_uuid: randomUUID(),
            item_uuid: randomUUID(),
            balance: -1,
            status: 'cancelled' as UserItemStatus,
            business_info_uuid: randomUUID()
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Balance cannot be negative")
        })

        it("Should throw an error if balance is not a number", async () => {
          const input = {
            user_info_uuid: randomUUID(),
            item_uuid: randomUUID(),
            balance: '1',
            status: 'cancelled' as UserItemStatus,
            business_info_uuid: randomUUID()
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Balance must be a valid number")
        })

        it("Should throw an error if status is invalid", async () => {
          const input: any = {
            user_info_uuid: randomUUID(),
            item_uuid: randomUUID(),
            balance: 1,
            status: 'any status',
            business_info_uuid: randomUUID()
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Invalid status")
        })

        it("Should throw an error if status is cancelled", async () => {
          const input: any = {
            user_info_uuid: randomUUID(),
            item_uuid: randomUUID(),
            balance: 1,
            status: 'cancelled',
            business_info_uuid: randomUUID()
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Invalid status")
        })

        it("Should throw an error if user is not found", async () => {
          const input: any = {
            user_info_uuid: randomUUID(),
            item_uuid: randomUUID(),
            balance: 1,
            status: 'active',
            business_info_uuid: randomUUID()
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(404)
          expect(result.body.error).toBe("App User not found")
        })

        it("Should throw an error if employer is trying to create a non employee user item", async () => {

          const input: any = {
            user_info_uuid: non_employee_user_info,
            item_uuid: randomUUID(),
            balance: 1,
            status: 'active',
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(403)
          expect(result.body.error).toBe("Unauthorized access")
        })
        it("Should create a new item be employer 1", async () => {

          const input: any = {
            user_info_uuid: employee_user_info,
            business_info_uuid: employer_info_uuid,
            item_uuid: benefit1_uuid,
            balance: 1,
            status: 'active',
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          pre_paid_user_item_uuid = result.body.uuid
          const searchUserItem = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).query({ userItemId: pre_paid_user_item_uuid })

          expect(searchUserItem.statusCode).toBe(200)
          expect(searchUserItem.body.uuid).toBe(result.body.uuid)
          expect(result.statusCode).toBe(201)
          expect(result.body.uuid).toBeTruthy()
          expect(result.body.user_info_uuid).toBe(input.user_info_uuid)
          expect(result.body.item_name).toBe("Vale Alimentação")
          expect(result.body.balance).toBe(1)
          expect(result.body.status).toBe(input.status)
          expect(result.body.business_info_uuid).toBe(employer_info_uuid)
          expect(result.body.created_at).toBeTruthy()

        })
        it("Should create a new item for the same user be employer 2", async () => {

          const input: any = {
            user_info_uuid: employee_user_info,
            business_info_uuid: employer_info_uuid2,
            item_uuid: benefit1_uuid,
            balance: 1,
            status: 'active',
          }

          const result = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token2}`).send(input)
          pre_paid_user_item_uuid = result.body.uuid
          const searchUserItem = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token2}`).query({ userItemId: pre_paid_user_item_uuid })

          expect(searchUserItem.statusCode).toBe(200)
          expect(searchUserItem.body.uuid).toBe(result.body.uuid)
          expect(result.statusCode).toBe(201)
          expect(result.body.uuid).toBeTruthy()
          expect(result.body.user_info_uuid).toBe(input.user_info_uuid)
          expect(result.body.item_name).toBe("Vale Alimentação")
          expect(result.body.balance).toBe(1)
          expect(result.body.status).toBe(input.status)
          expect(result.body.business_info_uuid).toBe(employer_info_uuid2)
          expect(result.body.created_at).toBeTruthy()

        })

      })
      describe("E2E find user item by id by employer", () => {
        it("Should throw an errir if user item id is missing", async () => {
          const input = {
            userItemId: ''
          }
          const result = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).query(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("User Item id is required")
        })

        it("Should throw an error if user item is not found", async () => {
          const input = {
            userItemId: randomUUID()
          }
          const result = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).query(input)
          expect(result.statusCode).toBe(404)
          expect(result.body.error).toBe("User Item not found")
        })

        it("Should return user item", async () => {
          const input = {
            userItemId: pre_paid_user_item_uuid
          }
          const result = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).query(input)
          expect(result.statusCode).toBe(200)
          expect(result.body.uuid).toBe(input.userItemId)
          expect(result.body.item_name).toBe("Vale Alimentação")
          expect(result.body.balance).toBe(1)
          expect(result.body.status).toBe('active')

        })
      })
      describe("E2E Find all user items by employer", () => {
        beforeAll(async () => {
          //create 2 more user items
          const userItem2: any = {
            user_info_uuid: employee_user_info,
            item_uuid: benefit2_uuid,
            balance: 1,
            status: 'active',
          }
          const userItem3: any = {
            user_info_uuid: employee_user_info,
            item_uuid: benefit3_uuid,
            balance: 1,
            status: 'active',
          }
          const createUserItem2 = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(userItem2)
          const createUserItem3 = await request(app).post("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(userItem3)

          post_paid_user_item_uuid = createUserItem2.body.uuid
          expect(createUserItem2.statusCode).toBe(201)
          expect(createUserItem3.statusCode).toBe(201)

        })
        it("Should throw an error if user info is missing", async () => {
          const input: any = {
            user_info_uuid: '',
          }

          const result = await request(app).get("/user-item/all/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("User Info id is required")
        })

        it("Should throw an error if user is not found", async () => {
          const input: any = {
            userInfoUuid: randomUUID(),
          }

          const result = await request(app).get("/user-item/all/employer").set('Authorization', `Bearer ${employer_user_token}`).query(input)
          expect(result.statusCode).toBe(404)
          expect(result.body.error).toBe("User not found")
        })

        it("Should throw an error if user is not employee", async () => {
          const input: any = {
            userInfoUuid: non_employee_user_info,
          }

          const result = await request(app).get("/user-item/all/employer").set('Authorization', `Bearer ${employer_user_token}`).query(input)
          expect(result.statusCode).toBe(403)
          expect(result.body.error).toBe("Unauthorized access")
        })

        it("Should return a list of user items by employer 1", async () => {
          const input: any = {
            userInfoUuid: employee_user_info,
          }

          const result = await request(app).get("/user-item/all/employer").set('Authorization', `Bearer ${employer_user_token}`).query(input)
          expect(result.statusCode).toBe(200)
          expect(result.body.length).toBe(3)
          result.body.forEach((userItem: any) => {
            expect(userItem.user_info_uuid).toBe(employee_user_info)
            expect(userItem.Provider.business_info_uuid).toBe(employer_info_uuid)
          });
        })
        it("Should return a list of user items by employer 2", async () => {
          const input: any = {
            userInfoUuid: employee_user_info,
          }

          const result = await request(app).get("/user-item/all/employer").set('Authorization', `Bearer ${employer_user_token2}`).query(input)
          expect(result.statusCode).toBe(200)
          expect(result.body.length).toBe(1)

          result.body.forEach((userItem: any) => {
            expect(userItem.user_info_uuid).toBe(employee_user_info)
            expect(userItem.Provider.business_info_uuid).toBe(employer_info_uuid2)
          });
        })
      })
      describe("E2E Block or Cancel User item by employer", () => {
        it("Should throw an error if item uuid is missing", async () => {
          const input: any = {
            user_item_uuid: '',
            status: 'cancelled'
          }

          const result = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe('User item uuid is required')
        })

        it("Should throw an error if item uuid is not found", async () => {
          const input: any = {
            user_item_uuid: randomUUID(),
            status: 'cancelled'
          }

          const result = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          expect(result.statusCode).toBe(404)
          expect(result.body.error).toBe('User Item not found')
        })

        it("Should return a blocked user item", async () => {
          const input: any = {
            user_item_uuid: pre_paid_user_item_uuid,
            status: 'blocked'
          }

          const result = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          const findInput = {
            userItemId: pre_paid_user_item_uuid
          }
          const findUserItem = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).query(findInput)
          expect(findUserItem.statusCode).toBe(200)
          expect(result.statusCode).toBe(200)
          expect(result.body.status).toBe(input.status)
          expect(findUserItem.body.status).toBe(input.status)
        })

        it("Should return a to be cancelled user item - post paid", async () => {
          const input: any = {
            user_item_uuid: post_paid_user_item_uuid,
            status: 'cancelled'
          }

          const result = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          const findInput = {
            userItemId: post_paid_user_item_uuid
          }

          const findUserItem = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).query(findInput)
          expect(findUserItem.statusCode).toBe(200)
          expect(result.statusCode).toBe(200)
          expect(findUserItem.body.status).toBe('to_be_cancelled')
          expect(findUserItem.body.grace_period_end_date).toBeTruthy()
          expect(findUserItem.body.cancelling_request_at).toBeTruthy()
          expect(findUserItem.body.updated_at).toBeTruthy()
        })

        it("Should return a cancelled user item - pre paid", async () => {
          const input: any = {
            user_item_uuid: pre_paid_user_item_uuid,
            status: 'cancelled'
          }

          const result = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)
          const findInput = {
            userItemId: pre_paid_user_item_uuid
          }
          const findUserItem = await request(app).get("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).query(findInput)

          expect(findUserItem.statusCode).toBe(200)
          expect(result.statusCode).toBe(200)
          expect(findUserItem.body.status).toBe('cancelled')
          expect(findUserItem.body.cancelled_at).toBeTruthy()
          expect(findUserItem.body.updated_at).toBeTruthy()
        })

        it("Should throw an error if trying to cancel an already cancelled user item", async () => {
          const input: any = {
            user_item_uuid: pre_paid_user_item_uuid,
            status: 'cancelled'
          }

          const result = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)

          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("User item already cancelled")
        })

        it("Should throw an error if trying to cancel an user item that is to be cancelled", async () => {
          const input: any = {
            user_item_uuid: post_paid_user_item_uuid,
            status: 'cancelled'
          }

          const result = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(input)

          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("User item already cancelled")
        })

      })
    })

    describe("E2E tests User items by app user", () => {
      describe("E2E Tests Find user item by app user", () => {
        it("Should return app user item", async () => {
          const input = {
            userItemId: pre_paid_user_item_uuid
          }
          const result = await request(app).get("/user-item").set('Authorization', `Bearer ${employeeAuthToken}`).query(input)
          expect(result.statusCode).toBe(200)
          expect(result.body.uuid).toBe(input.userItemId)
          expect(result.body.user_info_uuid).toBe(employee_user_info)

        })

        it("Should throw an error if user is not authorized", async () => {
          const input = {
            userItemId: pre_paid_user_item_uuid
          }
          const result = await request(app).get("/user-item").set('Authorization', `Bearer ${employeeAuthToken2}`).query(input)
          expect(result.statusCode).toBe(403)
          expect(result.body.error).toBe('Unauthorized access for user')

        })
      })

      describe("E2E Testes find all user items by user", () => {
        it("Should return user items", async () => {
          const result = await request(app).get("/user-item/all").set('Authorization', `Bearer ${employeeAuthToken}`)
          expect(result.statusCode).toBe(200)
          expect(result.body.length).toBe(4)
        })
        it("Should return empty array", async () => {
          const result = await request(app).get("/user-item/all").set('Authorization', `Bearer ${employeeAuthToken2}`)
          expect(result.statusCode).toBe(200)
          expect(result.body.length).toBe(0)
        })
      })
    })
  })

})
