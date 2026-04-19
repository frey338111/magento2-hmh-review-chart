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
}
