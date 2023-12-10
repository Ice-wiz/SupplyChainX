import { fetchGraphQLServer } from '@foundation/common/src/fetch/server'
import {
  MyWarehousesDocument,
  SortOrder,
  namedOperations,
} from '@foundation/network/src/generated'
import Link from 'next/link'
import { WarehouseCard } from '@foundation/ui/src/components/organisms/WarehouseCard'

export default async function WarehousesPage() {
  const { data, error } = await fetchGraphQLServer({
    document: MyWarehousesDocument,
    variables: { orderBy: { createdAt: SortOrder.Desc } },
    config: {
      next: {
        tags: [namedOperations.Query.myWarehouses],
      },
    },
  })

  console.log('data, error  ', data, error)
  return (
    <div>
      <div className="flex justify-between mb-6">
        <div>Warehouses</div>
        <Link href="/manufacturer/createWarehouse">New</Link>
      </div>

      {data?.myWarehouses.map((warehouse) => (
        <WarehouseCard warehouse={warehouse} key={warehouse.id} />
      ))}
    </div>
  )
}