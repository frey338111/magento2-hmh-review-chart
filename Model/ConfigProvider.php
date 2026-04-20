<?php
declare(strict_types=1);

namespace Hmh\ReviewChart\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

class ConfigProvider
{
    private const XML_PATH_ENABLED = 'hmh_reviewchart/general/enable';
    private const XML_PATH_RATING_CODE = 'hmh_reviewchart/general/rating_code';
    private const XML_PATH_REVIEW_ENABLED = 'catalog/review/active';
    private const XML_PATH_ADVANCED_MAX_VALUE = 'hmh_reviewchart/advanced/max_value';
    private const XML_PATH_ADVANCED_WIDTH = 'hmh_reviewchart/advanced/width';
    private const XML_PATH_ADVANCED_HEIGHT = 'hmh_reviewchart/advanced/height';
    private const XML_PATH_ADVANCED_CENTER_X = 'hmh_reviewchart/advanced/center_x';
    private const XML_PATH_ADVANCED_RADIUS = 'hmh_reviewchart/advanced/radius';
    private const XML_PATH_ADVANCED_LABEL_OFFSET = 'hmh_reviewchart/advanced/label_offset';
    private const XML_PATH_ADVANCED_AXIS_LABEL_FONT_SIZE = 'hmh_reviewchart/advanced/axis_label_font_size';
    private const XML_PATH_ADVANCED_AXIS_LABEL_COLOR = 'hmh_reviewchart/advanced/axis_label_color';
    private const XML_PATH_ADVANCED_SCALE_LABEL_FONT_SIZE = 'hmh_reviewchart/advanced/scale_label_font_size';
    private const XML_PATH_ADVANCED_SCALE_LABEL_COLOR = 'hmh_reviewchart/advanced/scale_label_color';
    private const XML_PATH_ADVANCED_DATA_FILL_COLOR = 'hmh_reviewchart/advanced/data_fill_color';
    private const XML_PATH_ADVANCED_DATA_FILL_OPACITY = 'hmh_reviewchart/advanced/data_fill_opacity';
    private const XML_PATH_ADVANCED_DATA_STROKE_COLOR = 'hmh_reviewchart/advanced/data_stroke_color';
    private const XML_PATH_ADVANCED_DATA_POINT_COLOR = 'hmh_reviewchart/advanced/data_point_color';
    private const XML_PATH_ADVANCED_POINT_RADIUS = 'hmh_reviewchart/advanced/point_radius';

    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig
    ) {
    }

    public function isEnabled(): bool
    {
        return $this->scopeConfig->isSetFlag(self::XML_PATH_ENABLED, ScopeInterface::SCOPE_STORE)
            && $this->scopeConfig->isSetFlag(self::XML_PATH_REVIEW_ENABLED, ScopeInterface::SCOPE_STORE);
    }

    /**
     * @return string[]
     */
    public function getRatingCodes(): array
    {
        $value = (string)$this->scopeConfig->getValue(self::XML_PATH_RATING_CODE, ScopeInterface::SCOPE_STORE);
        if ($value === '') {
            return [];
        }

        return array_map('trim', explode(',', $value));
    }

    /**
     * @return array<string, int|string>
     */
    public function getChartConfig(): array
    {
        return [
            'maxValue' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_MAX_VALUE),
            'width' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_WIDTH),
            'height' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_HEIGHT),
            'centerX' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_CENTER_X),
            'radius' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_RADIUS),
            'labelOffset' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_LABEL_OFFSET),
            'axisLabelFontSize' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_AXIS_LABEL_FONT_SIZE),
            'axisLabelColor' => $this->getStringValue(self::XML_PATH_ADVANCED_AXIS_LABEL_COLOR, '#1f2937'),
            'scaleLabelFontSize' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_SCALE_LABEL_FONT_SIZE),
            'scaleLabelColor' => $this->getStringValue(self::XML_PATH_ADVANCED_SCALE_LABEL_COLOR, '#6b7280'),
            'dataFillColor' => $this->getStringValue(self::XML_PATH_ADVANCED_DATA_FILL_COLOR, '#1d4ed8'),
            'dataFillOpacity' => $this->getOpacityValue(self::XML_PATH_ADVANCED_DATA_FILL_OPACITY, 0.32),
            'dataStrokeColor' => $this->getStringValue(self::XML_PATH_ADVANCED_DATA_STROKE_COLOR, '#1d4ed8'),
            'dataPointColor' => $this->getStringValue(self::XML_PATH_ADVANCED_DATA_POINT_COLOR, '#1d4ed8'),
            'pointRadius' => $this->getPositiveIntValue(self::XML_PATH_ADVANCED_POINT_RADIUS),
        ];
    }

    private function getPositiveIntValue(string $path): int
    {
        $value = (int) $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE);

        return $value > 0 ? $value : 1;
    }

    private function getStringValue(string $path, string $default): string
    {
        $value = trim((string) $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE));

        return $value !== '' ? $value : $default;
    }

    private function getOpacityValue(string $path, float $default): float
    {
        $value = (float) $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE);

        if ($value < 0 || $value > 1) {
            return $default;
        }

        return $value;
    }
}
