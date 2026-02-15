import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
const Greengrass = ({ list }) => {
  return (
    <div id="cardContainer" className="p-4">
      {list.map((item, index) => {
        return (
          <Card key={item.id} className="mx-auto w-full max-w-sm pt-0">
            <img
              src={item.pics?.[0]}
              className="aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">Featured</Badge>
              </CardAction>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>
                {item.content}
              </CardDescription>
            </CardHeader>
            <CardFooter />
          </Card>
        )
      })}
    </div>
  )
}

export default Greengrass;