import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { WarehousesService } from './warehouses.service'
import { Warehouse } from './entity/warehouse.entity'
import {
  FindManyWarehouseArgs,
  FindUniqueWarehouseArgs,
} from './dtos/find.args'
import { CreateWarehouseInput } from './dtos/create-warehouse.input'
import { UpdateWarehouseInput } from './dtos/update-warehouse.input'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { Manufacturer } from 'src/models/manufacturers/graphql/entity/manufacturer.entity'
import { Distributor } from 'src/models/distributors/graphql/entity/distributor.entity'
import { Retailer } from 'src/models/retailers/graphql/entity/retailer.entity'
import { Inventory } from 'src/models/inventories/graphql/entity/inventory.entity'
import { Transaction } from 'src/models/transactions/graphql/entity/transaction.entity'
import { Location } from 'src/models/locations/graphql/entity/location.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/util/types'

@Resolver(() => Warehouse)
export class WarehousesResolver {
  constructor(
    private readonly warehousesService: WarehousesService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => Warehouse)
  createWarehouse(@Args('createWarehouseInput') args: CreateWarehouseInput) {
    return this.warehousesService.create(args)
  }

  @Query(() => [Warehouse], { name: 'warehouses' })
  findAll(@Args() args: FindManyWarehouseArgs) {
    return this.warehousesService.findAll(args)
  }

  @AllowAuthenticated()
  @Query(() => [Warehouse], { name: 'myWarehouses' })
  myWarehouses(
    @Args() args: FindManyWarehouseArgs,
    @GetUser() user: GetUserType,
  ) {
    console.log('user ', user)
    return this.warehousesService.findAll({
      ...args,
      where: { ...args.where, manufacturerId: { equals: user.uid } },
    })
  }

  @Query(() => Warehouse, { name: 'warehouse' })
  findOne(@Args() args: FindUniqueWarehouseArgs) {
    return this.warehousesService.findOne(args)
  }

  @Mutation(() => Warehouse)
  updateWarehouse(@Args('updateWarehouseInput') args: UpdateWarehouseInput) {
    return this.warehousesService.update(args)
  }

  @Mutation(() => Warehouse)
  removeWarehouse(@Args() args: FindUniqueWarehouseArgs) {
    return this.warehousesService.remove(args)
  }

  @ResolveField(() => Location, { nullable: true })
  location(@Parent() warehouse: Warehouse) {
    return this.prisma.location.findUnique({
      where: { warehouseId: warehouse.id },
    })
  }

  @ResolveField(() => Manufacturer, { nullable: true })
  manufacturer(@Parent() warehouse: Warehouse) {
    if (!warehouse.manufacturerId) {
      return null
    }
    return this.prisma.manufacturer.findUnique({
      where: { uid: warehouse.manufacturerId },
    })
  }

  @ResolveField(() => Distributor, { nullable: true })
  distributor(@Parent() warehouse: Warehouse) {
    if (!warehouse.distributorId) {
      return null
    }
    return this.prisma.distributor.findUnique({
      where: { uid: warehouse.distributorId },
    })
  }

  @ResolveField(() => Retailer, { nullable: true })
  retailer(@Parent() warehouse: Warehouse) {
    if (!warehouse.retailerId) {
      return null
    }
    return this.prisma.retailer.findUnique({
      where: { uid: warehouse.retailerId },
    })
  }

  @ResolveField(() => [Inventory])
  inventories(@Parent() warehouse: Warehouse) {
    return this.prisma.inventory.findMany({
      where: { warehouseId: warehouse.id },
    })
  }

  @ResolveField(() => [Transaction])
  outs(@Parent() warehouse: Warehouse) {
    return this.prisma.transaction.findMany({
      where: { fromWarehouseId: warehouse.id },
    })
  }

  @ResolveField(() => [Transaction])
  ins(@Parent() warehouse: Warehouse) {
    return this.prisma.transaction.findMany({
      where: { toWarehouseId: warehouse.id },
    })
  }
}
