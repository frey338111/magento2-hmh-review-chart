(function () {
    'use strict';

    function getOption(config, key) {
        return Number(config[key]) || 0;
    }

    function getStringOption(config, key, fallback) {
        return typeof config[key] === 'string' && config[key] !== '' ? config[key] : fallback;
    }

    function getOpacityOption(config, key, fallback) {
        const value = Number(config[key]);

        if (Number.isNaN(value) || value < 0 || value > 1) {
            return fallback;
        }

        return value;
    }

    function hexToRgba(hexColor, opacity) {
        const normalized = String(hexColor || '').replace('#', '');

        if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
            return hexColor;
        }

        const red = parseInt(normalized.slice(0, 2), 16);
        const green = parseInt(normalized.slice(2, 4), 16);
        const blue = parseInt(normalized.slice(4, 6), 16);

        return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + opacity + ')';
    }

    function getCenterY(config) {
        return getOption(config, 'height') / 2;
    }

    function toPoint(config, angle, radius) {
        return {
            x: getOption(config, 'centerX') + Math.cos(angle) * radius,
            y: getCenterY(config) + Math.sin(angle) * radius
        };
    }

    function drawPolygon(ctx, points, strokeStyle, fillStyle, lineWidth) {
        if (!points.length) {
            return;
        }

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        points.slice(1).forEach(function (point) {
            ctx.lineTo(point.x, point.y);
        });

        ctx.closePath();

        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }

        if (strokeStyle) {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        }
    }

    function buildRegularPolygon(config, totalAxes, radius) {
        const step = (Math.PI * 2) / totalAxes;
        const startAngle = -Math.PI / 2;
        const points = [];

        for (let index = 0; index < totalAxes; index += 1) {
            points.push(toPoint(config, startAngle + (step * index), radius));
        }

        return points;
    }

    function drawGrid(ctx, chartConfig, totalAxes) {
        const maxValue = getOption(chartConfig, 'maxValue');
        const radius = getOption(chartConfig, 'radius');

        ctx.save();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;

        for (let level = 1; level <= maxValue; level += 1) {
            drawPolygon(
                ctx,
                buildRegularPolygon(chartConfig, totalAxes, radius * (level / maxValue)),
                '#d1d5db',
                null,
                1.5
            );
        }

        ctx.restore();
    }

    function drawAxes(ctx, chartConfig, labels) {
        const totalAxes = labels.length;
        const step = (Math.PI * 2) / totalAxes;
        const startAngle = -Math.PI / 2;
        const centerX = getOption(chartConfig, 'centerX');
        const centerY = getCenterY(chartConfig);
        const radius = getOption(chartConfig, 'radius');
        const labelOffset = getOption(chartConfig, 'labelOffset');
        const axisLabelFontSize = getOption(chartConfig, 'axisLabelFontSize');

        ctx.save();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.fillStyle = getStringOption(chartConfig, 'axisLabelColor', '#1f2937');
        ctx.font = axisLabelFontSize + 'px Arial, sans-serif';

        labels.forEach(function (label, index) {
            const angle = startAngle + (step * index);
            const endPoint = toPoint(chartConfig, angle, radius);
            const labelPoint = toPoint(chartConfig, angle, radius + labelOffset);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();

            ctx.textAlign = labelPoint.x < centerX - 5 ? 'right' : (labelPoint.x > centerX + 5 ? 'left' : 'center');
            ctx.textBaseline = labelPoint.y < centerY - 5 ? 'bottom' : (labelPoint.y > centerY + 5 ? 'top' : 'middle');
            ctx.fillText(label, labelPoint.x, labelPoint.y);
        });

        ctx.restore();
    }

    function drawScaleLabels(ctx, chartConfig) {
        const maxValue = getOption(chartConfig, 'maxValue');
        const centerX = getOption(chartConfig, 'centerX');
        const centerY = getCenterY(chartConfig);
        const radius = getOption(chartConfig, 'radius');
        const scaleLabelFontSize = getOption(chartConfig, 'scaleLabelFontSize');

        ctx.save();
        ctx.fillStyle = getStringOption(chartConfig, 'scaleLabelColor', '#6b7280');
        ctx.font = scaleLabelFontSize + 'px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let level = 1; level <= maxValue; level += 1) {
            ctx.fillText(String(level), centerX, centerY - (radius * (level / maxValue)));
        }

        ctx.restore();
    }

    function buildDataPoints(chartConfig, ratings, labels) {
        const totalAxes = labels.length;
        const step = (Math.PI * 2) / totalAxes;
        const startAngle = -Math.PI / 2;
        const maxValue = getOption(chartConfig, 'maxValue');
        const radius = getOption(chartConfig, 'radius');

        return labels.map(function (label, index) {
            const value = Number(ratings[label]) || 0;
            const normalizedValue = Math.max(0, Math.min(maxValue, value));
            const pointRadius = radius * (normalizedValue / maxValue);

            return toPoint(chartConfig, startAngle + (step * index), pointRadius);
        });
    }

    function drawDataShape(ctx, chartConfig, ratings, labels) {
        const points = buildDataPoints(chartConfig, ratings, labels);
        const pointRadius = getOption(chartConfig, 'pointRadius');
        const dataFillColor = getStringOption(chartConfig, 'dataFillColor', '#1d4ed8');
        const dataFillOpacity = getOpacityOption(chartConfig, 'dataFillOpacity', 0.32);
        const dataStrokeColor = getStringOption(chartConfig, 'dataStrokeColor', '#1d4ed8');
        const dataPointColor = getStringOption(chartConfig, 'dataPointColor', '#1d4ed8');

        drawPolygon(
            ctx,
            points,
            dataStrokeColor,
            hexToRgba(dataFillColor, dataFillOpacity),
            3
        );

        points.forEach(function (point) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2, false);
            ctx.fillStyle = dataPointColor;
            ctx.fill();
        });
    }

    function createCanvas(doc, chartConfig) {
        const width = getOption(chartConfig, 'width');
        const height = getOption(chartConfig, 'height');
        const canvas = doc.createElement('canvas');

        canvas.width = width;
        canvas.height = height;
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.maxWidth = width + 'px';
        canvas.style.height = 'auto';

        return canvas;
    }

    function renderChart(ratings, chartConfig, element) {
        const labels = Object.keys(ratings || {});
        const doc = element.ownerDocument;

        element.innerHTML = '';

        if (!labels.length) {
            return;
        }

        const canvas = createCanvas(doc, chartConfig);
        const ctx = canvas.getContext('2d');

        element.appendChild(canvas);

        drawGrid(ctx, chartConfig, labels.length);
        drawAxes(ctx, chartConfig, labels);
        drawScaleLabels(ctx, chartConfig);
        drawDataShape(ctx, chartConfig, ratings, labels);
    }

    function parseJsonAttribute(value, fallback) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    window.renderHmhReviewChart = function (element) {
        const ratings = parseJsonAttribute(element.dataset.ratings, {});
        const chartConfig = parseJsonAttribute(element.dataset.chartConfig, {});

        renderChart(ratings, chartConfig, element);
    };
}());
