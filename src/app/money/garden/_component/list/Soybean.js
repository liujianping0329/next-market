import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
const Soybean = ({ list }) => {
    return (
            <div id="cardContainer" className="p-4">
                {list.map((item, index) => {
                    return (
                        <Card key={item.id} className="mx-auto w-full max-w-sm pt-0">
                            <CardHeader>
                              <CardAction>
                              </CardAction>
                              <CardTitle>{item.title}</CardTitle>
                              <CardDescription>
                              </CardDescription>
                            </CardHeader>
                            <CardFooter />
                        </Card>
                    )
                })} 
            </div>
    )
}

export default Soybean;