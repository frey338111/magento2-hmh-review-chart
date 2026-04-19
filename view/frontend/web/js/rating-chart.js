define([], function () {
    'use strict';

    var MAX_VALUE = 5;
    var WIDTH = 560;
    var HEIGHT = 480;
    var CENTER_X = 240;
    var CENTER_Y = HEIGHT / 2;
    var RADIUS = 136;
    var LABEL_OFFSET = 28;
    var AXIS_LABEL_FONT_SIZE = 19;
    var SCALE_LABEL_FONT_SIZE = 16;
    var POINT_RADIUS = 4;

    function toPoint(angle, radius) {
        return {
            x: CENTER_X + Math.cos(angle) * radius,
            y: CENTER_Y + Math.sin(angle) * radius
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

    function drawGrid(ctx, totalAxes) {
        var level;

        ctx.save();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;

        for (level = 1; level <= MAX_VALUE; level += 1) {
            drawPolygon(
                ctx,
                buildRegularPolygon(totalAxes, RADIUS * (level / MAX_VALUE)),
                '#d1d5db',
                null,
                1.5
            );
        }

        ctx.restore();
    }

    function buildRegularPolygon(totalAxes, radius) {
        var step = (Math.PI * 2) / totalAxes;
        var startAngle = -Math.PI / 2;
        var points = [];
        var index;

        for (index = 0; index < totalAxes; index += 1) {
            points.push(toPoint(startAngle + (step * index), radius));
        }

        return points;
    }

    function drawAxes(ctx, labels) {
        var totalAxes = labels.length;
        var step = (Math.PI * 2) / totalAxes;
        var startAngle = -Math.PI / 2;

        labels.forEach(function (label, index) {
            var angle = startAngle + (step * index);
            var endPoint = toPoint(angle, RADIUS);
            var labelPoint = toPoint(angle, RADIUS + LABEL_OFFSET);

            ctx.beginPath();
            ctx.moveTo(CENTER_X, CENTER_Y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#9ca3af';
            ctx.stroke();

            ctx.fillStyle = '#1f2937';
            ctx.font = '600 ' + AXIS_LABEL_FONT_SIZE + 'px Arial, sans-serif';
            ctx.textAlign = labelPoint.x >= CENTER_X + 8 ? 'left' : (labelPoint.x <= CENTER_X - 8 ? 'right' : 'center');
            ctx.textBaseline = labelPoint.y >= CENTER_Y + 8 ? 'top' : (labelPoint.y <= CENTER_Y - 8 ? 'bottom' : 'middle');
            ctx.fillText(label, labelPoint.x, labelPoint.y);
        });
    }

    function drawScaleLabels(ctx) {
        var level;

        ctx.save();
        ctx.fillStyle = '#6b7280';
        ctx.font = SCALE_LABEL_FONT_SIZE + 'px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (level = 1; level <= MAX_VALUE; level += 1) {
            ctx.fillText(String(level), CENTER_X, CENTER_Y - (RADIUS * (level / MAX_VALUE)));
        }

        ctx.restore();
    }

    function buildDataPoints(ratings, labels) {
        var totalAxes = labels.length;
        var step = (Math.PI * 2) / totalAxes;
        var startAngle = -Math.PI / 2;

        return labels.map(function (label, index) {
            var value = Number(ratings[label]) || 0;
            var normalizedValue = Math.max(0, Math.min(MAX_VALUE, value));
            var radius = RADIUS * (normalizedValue / MAX_VALUE);

            return toPoint(startAngle + (step * index), radius);
        });
    }

    function drawDataShape(ctx, ratings, labels) {
        var points = buildDataPoints(ratings, labels);

        drawPolygon(ctx, points, '#1d4ed8', 'rgba(29, 78, 216, 0.32)', 3);

        points.forEach(function (point) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2, false);
            ctx.fillStyle = '#1d4ed8';
            ctx.fill();
        });
    }

    function createCanvas(doc) {
        var canvas = doc.createElement('canvas');

        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.maxWidth = WIDTH + 'px';
        canvas.style.height = 'auto';

        return canvas;
    }

    return function (config, element) {
        var ratings = config.ratings || {};
        var labels = Object.keys(ratings);
        var doc = element.ownerDocument;
        var canvas;
        var ctx;

        element.innerHTML = '';

        if (!labels.length) {
            return;
        }

        canvas = createCanvas(doc);
        element.appendChild(canvas);
        ctx = canvas.getContext('2d');

        drawGrid(ctx, labels.length);
        drawAxes(ctx, labels);
        drawScaleLabels(ctx);
        drawDataShape(ctx, ratings, labels);
    };
});
