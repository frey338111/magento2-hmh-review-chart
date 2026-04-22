define([], function () {
    'use strict';

    const ratingChart = {
        getOption: function (config, key) {
            return Number(config[key]) || 0;
        },

        getStringOption: function (config, key, fallback) {
            return typeof config[key] === 'string' && config[key] !== '' ? config[key] : fallback;
        },

        getOpacityOption: function (config, key, fallback) {
            const value = Number(config[key]);

            if (Number.isNaN(value) || value < 0 || value > 1) {
                return fallback;
            }

            return value;
        },

        hexToRgba: function (hexColor, opacity) {
            const normalized = hexColor.replace('#', '');

            if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
                return hexColor;
            }

            const red = parseInt(normalized.slice(0, 2), 16);
            const green = parseInt(normalized.slice(2, 4), 16);
            const blue = parseInt(normalized.slice(4, 6), 16);

            return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + opacity + ')';
        },

        getCenterY: function (config) {
            return this.getOption(config, 'height') / 2;
        },

        toPoint: function (config, angle, radius) {
            return {
                x: this.getOption(config, 'centerX') + Math.cos(angle) * radius,
                y: this.getCenterY(config) + Math.sin(angle) * radius
            };
        },

        drawPolygon: function (ctx, points, strokeStyle, fillStyle, lineWidth) {
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
        },

        buildRegularPolygon: function (config, totalAxes, radius) {
            const step = (Math.PI * 2) / totalAxes;
            const startAngle = -Math.PI / 2;
            const points = [];

            for (let index = 0; index < totalAxes; index += 1) {
                points.push(this.toPoint(config, startAngle + (step * index), radius));
            }

            return points;
        },

        drawGrid: function (ctx, chartConfig, totalAxes) {
            const maxValue = this.getOption(chartConfig, 'maxValue');
            const radius = this.getOption(chartConfig, 'radius');

            ctx.save();
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;

            for (let level = 1; level <= maxValue; level += 1) {
                this.drawPolygon(
                    ctx,
                    this.buildRegularPolygon(chartConfig, totalAxes, radius * (level / maxValue)),
                    '#d1d5db',
                    null,
                    1.5
                );
            }

            ctx.restore();
        },

        drawAxes: function (ctx, chartConfig, labels) {
            const totalAxes = labels.length;
            const step = (Math.PI * 2) / totalAxes;
            const startAngle = -Math.PI / 2;
            const centerX = this.getOption(chartConfig, 'centerX');
            const centerY = this.getCenterY(chartConfig);
            const radius = this.getOption(chartConfig, 'radius');
            const labelOffset = this.getOption(chartConfig, 'labelOffset');
            const axisLabelFontSize = this.getOption(chartConfig, 'axisLabelFontSize');

            labels.forEach(function (label, index) {
                const angle = startAngle + (step * index);
                const endPoint = this.toPoint(chartConfig, angle, radius);
                const labelPoint = this.toPoint(chartConfig, angle, radius + labelOffset);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(endPoint.x, endPoint.y);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#9ca3af';
                ctx.stroke();

                ctx.fillStyle = this.getStringOption(chartConfig, 'axisLabelColor', '#1f2937');
                ctx.font = '600 ' + axisLabelFontSize + 'px Arial, sans-serif';
                ctx.textAlign = labelPoint.x >= centerX + 8 ? 'left' : (labelPoint.x <= centerX - 8 ? 'right' : 'center');
                ctx.textBaseline = labelPoint.y >= centerY + 8 ? 'top' : (labelPoint.y <= centerY - 8 ? 'bottom' : 'middle');
                ctx.fillText(label, labelPoint.x, labelPoint.y);
            }, this);
        },

        drawScaleLabels: function (ctx, chartConfig) {
            const maxValue = this.getOption(chartConfig, 'maxValue');
            const centerX = this.getOption(chartConfig, 'centerX');
            const centerY = this.getCenterY(chartConfig);
            const radius = this.getOption(chartConfig, 'radius');
            const scaleLabelFontSize = this.getOption(chartConfig, 'scaleLabelFontSize');

            ctx.save();
            ctx.fillStyle = this.getStringOption(chartConfig, 'scaleLabelColor', '#6b7280');
            ctx.font = scaleLabelFontSize + 'px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let level = 1; level <= maxValue; level += 1) {
                ctx.fillText(String(level), centerX, centerY - (radius * (level / maxValue)));
            }

            ctx.restore();
        },

        buildDataPoints: function (chartConfig, ratings, labels) {
            const totalAxes = labels.length;
            const step = (Math.PI * 2) / totalAxes;
            const startAngle = -Math.PI / 2;
            const maxValue = this.getOption(chartConfig, 'maxValue');
            const radius = this.getOption(chartConfig, 'radius');

            return labels.map(function (label, index) {
                const value = Number(ratings[label]) || 0;
                const normalizedValue = Math.max(0, Math.min(maxValue, value));
                const pointRadius = radius * (normalizedValue / maxValue);

                return this.toPoint(chartConfig, startAngle + (step * index), pointRadius);
            }, this);
        },

        drawDataShape: function (ctx, chartConfig, ratings, labels) {
            const points = this.buildDataPoints(chartConfig, ratings, labels);
            const pointRadius = this.getOption(chartConfig, 'pointRadius');
            const dataFillColor = this.getStringOption(chartConfig, 'dataFillColor', '#1d4ed8');
            const dataFillOpacity = this.getOpacityOption(chartConfig, 'dataFillOpacity', 0.32);
            const dataStrokeColor = this.getStringOption(chartConfig, 'dataStrokeColor', '#1d4ed8');
            const dataPointColor = this.getStringOption(chartConfig, 'dataPointColor', '#1d4ed8');

            this.drawPolygon(
                ctx,
                points,
                dataStrokeColor,
                this.hexToRgba(dataFillColor, dataFillOpacity),
                3
            );

            points.forEach(function (point) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2, false);
                ctx.fillStyle = dataPointColor;
                ctx.fill();
            });
        },

        createCanvas: function (doc, chartConfig) {
            const width = this.getOption(chartConfig, 'width');
            const height = this.getOption(chartConfig, 'height');
            const canvas = doc.createElement('canvas');

            canvas.width = width;
            canvas.height = height;
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.maxWidth = width + 'px';
            canvas.style.height = 'auto';

            return canvas;
        },

        render: function (config, element) {
            const ratings = config.ratings || {};
            const chartConfig = config.chartConfig || {};
            const labels = Object.keys(ratings);
            const doc = element.ownerDocument;

            element.innerHTML = '';

            if (!labels.length) {
                return;
            }

            const canvas = this.createCanvas(doc, chartConfig);
            const ctx = canvas.getContext('2d');

            element.appendChild(canvas);

            this.drawGrid(ctx, chartConfig, labels.length);
            this.drawAxes(ctx, chartConfig, labels);
            this.drawScaleLabels(ctx, chartConfig);
            this.drawDataShape(ctx, chartConfig, ratings, labels);
        }
    };

    return function (config, element) {
        ratingChart.render(config, element);
    };
});
