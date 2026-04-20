<?php
declare(strict_types=1);

namespace Hmh\ReviewChart\Block\Adminhtml\System\Config\Form\Field;

use Magento\Config\Block\System\Config\Form\Field;
use Magento\Framework\Data\Form\Element\AbstractElement;

class ColorPicker extends Field
{
    protected function _getElementHtml(AbstractElement $element): string
    {
        $value = $this->normalizeHexColor((string) $element->getValue());

        if ($value !== null) {
            $element->setValue($value);
        }

        $element->setData('type', 'color');
        $element->setData('style', 'width: 6rem; padding: 0;');

        return $element->getElementHtml();
    }

    private function normalizeHexColor(string $value): ?string
    {
        $normalized = ltrim(trim($value), '#');

        if (preg_match('/^[0-9a-fA-F]{3}$/', $normalized) === 1) {
            return '#' . preg_replace('/(.)/', '$1$1', strtolower($normalized));
        }

        if (preg_match('/^[0-9a-fA-F]{6}$/', $normalized) === 1) {
            return '#' . strtolower($normalized);
        }

        return null;
    }
}
