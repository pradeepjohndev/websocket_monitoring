import { useEffect, useState } from "react";
import { IoIosPeople } from "react-icons/io";
import { FaPersonCircleCheck, FaPersonCircleXmark } from "react-icons/fa6";


export default function Devices({ ws }) {
    const [total, setTotal] = useState(0);
    const [online, setOnline] = useState(0);
    const [offline, setOffline] = useState(0);

    useEffect(() => {
        if (!ws) return;

        const handleMessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "COUNTS_UPDATE") {
                setTotal(data.payload.totalDevices);
                setOnline(data.payload.onlineDevices);
                setOffline(data.payload.offlineDevices);
            }
        };

        ws.addEventListener("message", handleMessage);

        return () => {
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws]);

    return (
        <div className="devices" style={{ color: "white" }}>
            <p><IoIosPeople />Total Devices: {total}</p>
            <p><FaPersonCircleCheck /> Online: {online}</p>
            <p><FaPersonCircleXmark /> Offline: {offline}</p>
        </div>
    );
}
