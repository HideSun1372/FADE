import { useEffect, useState } from "react"

export default function Battle() {

    const [enemy, setEnemy] = useState<any>(null);

    useEffect(() => {
        const fetchEnemy = async() => {
            const response = await fetch ("http://localhost:8080/api/enemy?EnemyID=0"); 
            const enemy = await response.json();
            console.log("Enemy fetched! ", enemy)
            setEnemy(enemy);
        }
        fetchEnemy();
    }, [])

    return (
        <div>
            <h1>{enemy?.name}</h1>
            <p>Health: {enemy?.health}</p>
            <p>Your health: 100</p>
        </div>
    )
}