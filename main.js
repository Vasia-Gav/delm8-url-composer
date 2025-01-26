let routePathSaved = NaN;

document.getElementById('to-data').addEventListener('click', () => {
    const url = document.getElementById('url-input').value;
    try {
        const urlParts = url.split('?');
        if (urlParts.length < 2) throw new Error('Invalid URL structure.');

        const queryParams = new URLSearchParams(urlParts[1]);
        const routePath = urlParts[0].split('/');
        routePathSaved = routePath;
        if (routePath.length < 5) throw new Error('Invalid route path.');

        const routePoints = routePath[3].split(';');

        const startPoint = routePath[4];
        const finishPoint = routePath[5];
        const roundTrip = routePath[6];

        document.getElementById('round-trip').textContent = roundTrip;
        document.getElementById('departure-time').textContent = toHumanReadableTime(parseInt(queryParams.get('departure') || 'Not specified', 10));
        document.getElementById('rescheduling').textContent = queryParams.get('rescheduling') || 'Not specified';
        document.getElementById('straight-route-threshold').textContent = queryParams.get('straight_route_threshold') || 'Not specified';
        document.getElementById('profile').textContent = queryParams.get('profile') || 'Not specified';

        const table = document.getElementById('route-table');
        table.innerHTML = `
            <tr>
                <th>Index</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Stop Time</th>
            </tr>
        `;

        routePoints.forEach((point, index) => {
            const parts = point.split(',');
            if (parts.length !== 5) throw new Error(`Invalid point format at index ${index}`);

            const [latitude, longitude, startTime, endTime, stopTime] = parts;

            const row = document.createElement('tr'); //todo:
            if (index == 0) {
                row.className =  "departure"
            }
            if (index == startPoint)
            {
                row.className =  "start"
            }
            if (index == finishPoint)
            {
                row.className = "finish"
            }

            row.innerHTML = `
                <td contenteditable="true">${index}</td>
                <td contenteditable="true">${parseFloat(latitude)}</td>
                <td contenteditable="true">${parseFloat(longitude)}</td>
                <td contenteditable="true">${toHumanReadableTime(parseInt(startTime, 10))}</td>
                <td contenteditable="true">${toHumanReadableTime(parseInt(endTime, 10))}</td>
                <td contenteditable="true">${parseInt(stopTime, 10)}</td>
            `;
            table.appendChild(row);
        });

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('to-url').addEventListener('click', () => {
    try {
        const table = document.getElementById('route-table');
        const rows = Array.from(table.querySelectorAll('tr')).slice(1); // Skip header
        const routePoints = rows.map(row => {
            const cells = row.querySelectorAll('td');
            return `${cells[1].innerText},${cells[2].innerText},${toUnixDateTime(cells[3].innerText)},${toUnixDateTime(cells[4].innerText)},${cells[5].innerText}`;
        }).join(';').replace(/,+/g, ",");

        const roundTrip = document.getElementById('round-trip').innerText;
        const startPoint = document.getElementsByClassName('start').length ? document.getElementsByClassName('start').innerText : -1;
        const finishPoint = document.getElementsByClassName('finish').length ? document.getElementsByClassName('finish').innerText : -1;

        const departureTime = document.getElementById('departure-time').innerText;
        const rescheduling = document.getElementById('rescheduling').innerText;
        const straightRouteThreshold = document.getElementById('straight-route-threshold').innerText;
        const profile = document.getElementById('profile').innerText;

        let queryParams = (departureTime !== "Not specified") ? { departure: new Date(departureTime).getTime() / 1000 } : {};
        if (rescheduling !== "Not specified") {
            queryParams["rescheduling"] = rescheduling;
        }
        if (straightRouteThreshold !== "Not specified") {
            queryParams["straight_route_threshold"] = straightRouteThreshold;
        }
        if (profile !== "Not specified") {
            queryParams["profile"] = profile;
        }
        queryParams = new URLSearchParams(queryParams);

        if (!routePathSaved) {
            alert('Generated path does not contain scheme, host, and port')
        }
        const url = `${routePathSaved[0]}//${routePathSaved[1]}${routePathSaved[2]}/${routePoints}/${startPoint}/${finishPoint}/${roundTrip}?${queryParams.toString()}`;
        document.getElementById('url-input').value = url;

    } catch (error) {
        alert(error.message);
    }
});

function toHumanReadableTime(unix_timestamp) {
    if (unix_timestamp === -1) {
        return "Not specified";
    }
    const date = new Date(unix_timestamp * 1000);
    return date.toISOString().replace('T', ' ').split('.')[0];
}

function toUnixDateTime(dateString) {
    try {
        const date = new Date(dateString.replace(" ", "T")+"+00:00"); // Заменяем пробел на 'T' для корректного ISO формата
        if (isNaN(date.getTime())) {
            return "-1";
        }
        return (date.getTime() / 1000).toFixed(0);
    } catch (error) {
        console.error("Ошибка преобразования:", error.message);
        return null;
    }
}

//
// function toHumanReadableTime(unix_timestamp) {
//     if (unix_timestamp === -1) {
//         return "Not specified";
//     }
//     const date = new Date(unix_timestamp * 1000);
//     return date.toISOString().replace('T', ' ').slice(0, 19); // Убираем миллисекунды
// }
//
// function toUnixDateTime(dateString) {
//     try {
//         const date = new Date(dateString.replace(" ", "T"));
//         if (isNaN(date.getTime())) {
//             return "-1";
//         }
//         return (date.getTime() / 1000).toFixed(0); // Сохраняем точность
//     } catch (error) {
//         console.error("Ошибка преобразования:", error.message);
//         return null;
//     }
// }
