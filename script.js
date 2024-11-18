let map;
let routingControl;

const hereApiKey = 'IrCBFiTRCFo5pZNw23yztkeKxv1UWK2nPvcaFxWtIYM'; // Thay bằng API Key từ HERE Maps

function initMap() {
    // Khởi tạo bản đồ với Here Maps TileLayer và lớp Traffic
    map = L.map("map").setView([10.762622, 106.660172], 13);

    // Lớp bản đồ từ Here Maps
    L.tileLayer(`https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey=${hereApiKey}`, {
        attribution: '© HERE Maps',
        maxZoom: 20
    }).addTo(map);

    // Lớp giao thông Here Maps
    L.tileLayer(`https://2.traffic.maps.ls.hereapi.com/maptile/2.1/flowtile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey=${hereApiKey}`, {
        attribution: '© HERE Traffic',
        maxZoom: 20,
        opacity: 0.6 // Độ trong suốt để hiển thị đường giao thông rõ ràng hơn
    }).addTo(map);
}

function calculateRoute() {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const selectedTime = document.getElementById("time").value;

    if (!origin || !destination || !selectedTime) {
        alert("Vui lòng nhập đầy đủ điểm xuất phát, điểm đến và thời gian!");
        return;
    }

    // Xóa tuyến đường cũ nếu có
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Tạo tuyến đường mới với OSRM thông qua Leaflet Routing Machine
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(10.762622, 106.660172), // Tọa độ mặc định nếu không có địa chỉ cụ thể
            L.latLng(10.762622, 106.660172) // Sẽ thay đổi bằng tọa độ thực tế
        ],
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim(),
        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
        lineOptions: {
            styles: [{ color: isRushHour(selectedTime) ? 'red' : 'blue', opacity: 0.7, weight: 5 }]
        }
    }).addTo(map);

    // Geocode địa chỉ để lấy tọa độ
    L.Control.Geocoder.nominatim().geocode(origin, function(results) {
        if (results.length > 0) {
            const originCoords = results[0].center;
            routingControl.spliceWaypoints(0, 1, originCoords);

            L.Control.Geocoder.nominatim().geocode(destination, function(results) {
                if (results.length > 0) {
                    const destinationCoords = results[0].center;
                    routingControl.spliceWaypoints(routingControl.getWaypoints().length - 1, 1, destinationCoords);

                    // Kiểm tra và hiển thị thông báo nếu có đoạn đường kẹt xe
                    displayTrafficAlertOnRoute(originCoords, destinationCoords);
                } else {
                    alert("Không tìm thấy điểm đến!");
                }
            });
        } else {
            alert("Không tìm thấy điểm xuất phát!");
        }
    });
}

// Hàm kiểm tra xem thời gian nhập vào có phải là giờ cao điểm không
function isRushHour(selectedTime) {
    const time = new Date(selectedTime);
    const hour = time.getHours();

    // Giờ cao điểm: buổi sáng 7:00-9:00 và buổi chiều 16:00-18:00
    return (hour >= 7 && hour < 9) || (hour >= 16 && hour < 18);
}

// Hàm hiển thị cảnh báo giao thông trên tuyến đường
function displayTrafficAlertOnRoute(originCoords, destinationCoords) {
    const url = `https://traffic.ls.hereapi.com/traffic/6.2/flow.json?apiKey=${hereApiKey}&prox=${originCoords.lat},${originCoords.lng},5000`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const alerts = data.RWS[0].RW;
            let hasCongestion = false;

            alerts.forEach(alert => {
                if (alert.FIS[0].FI[0].TMC.DE.includes("Congestion")) {
                    hasCongestion = true;
                    const trafficAlert = L.marker([alert.FIS[0].FI[0].TMC.POINT.LAT, alert.FIS[0].FI[0].TMC.POINT.LONG])
                        .addTo(map)
                        .bindPopup("Cảnh báo: Đoạn đường này đang bị kẹt xe.")
                        .openPopup();
                }
            });

            // Hiển thị cảnh báo nếu có tắc nghẽn giao thông
            const warningDiv = document.getElementById("traffic-warning");
            if (hasCongestion) {
                warningDiv.style.display = "block";
                warningDiv.textContent = "Lưu ý: Có đoạn đường đang kẹt xe trên tuyến đường này.";
            } else {
                warningDiv.style.display = "none";
            }
        })
        .catch(error => console.error("Error fetching traffic data:", error));
}

// Khởi tạo bản đồ khi tải trang
window.onload = initMap;
