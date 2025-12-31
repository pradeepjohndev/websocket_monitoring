import si from "systeminformation";

async function logNetworkSpeed() {
  try {
    const stats = await si.networkStats(); // all interfaces
    const net = stats[0]; // first active interface

    const downloadKB = (net.rx_sec / 1024).toFixed(2);
    const uploadKB = (net.tx_sec / 1024).toFixed(2);

    console.clear();
    console.log("📡 Network Speed (per second)");
    console.log(`⬇️ Download: ${downloadKB} KB/s`);
    console.log(`⬆️ Upload  : ${uploadKB} KB/s`);
    console.log(
      pc.stats.memory.used,
      pc.stats.memory.free,
      pc.staticInfo.memory.total
    );
  } catch (err) {
    console.error("Error fetching network stats:", err);
  }
}

setInterval(logNetworkSpeed, 1000);
