/**
 * Barrel de tipos – MAGERIT v3 Risk Analysis
 * Todos los modelos derivan literalmente del Libro II – Catálogo de Elementos
 */

// §3 – Dimensiones de valoración
export type {
  DimensionCode,
  Dimension,
  DimensionValue,
  AssetValuation,
} from './dimension.types';

// §4 – Criterios de valoración
export type {
  ValuationCriterionCode,
  ValuationScale,
  AppliedCriterion,
  ValuationCriteria,
} from './valuation.types';

// §2 – Tipos de activos
export type {
  DataSubtype,
  KeySubtype,
  ServiceSubtype,
  SoftwareSubtype,
  HardwareSubtype,
  CommsSubtype,
  MediaSubtype,
  AuxSubtype,
  FacilitySubtype,
  PersonnelSubtype,
  AssetTypeCode,
  AssetSubtype,
  AssetType,
  AssetDependency,
  Asset,
} from './asset.types';

// §5 – Amenazas
export type {
  ThreatOrigin,
  ThreatCause,
  ThreatGroup,
  ThreatFrequencyLevel,
  NaturalThreatCode,
  IndustrialThreatCode,
  ErrorThreatCode,
  AttackThreatCode,
  ThreatCode,
  AffectedDimension,
  Threat,
  ThreatLevel,
} from './threat.types';

// Riesgo (§5 aplicado + §A4.2, §A4.4)
export type {
  RiskStatus,
  RiskCalculation,
  ResidualRisk,
  Risk,
} from './risk.types';

// Controles ISO 27001 (salvaguardas)
export type {
  SafeguardFamily,
  SafeguardResponsable,
  Safeguard,
  SafeguardStatus,
} from './safeguard.types';

// Mapeo Riesgo ↔ Salvaguarda (§A4.3, §A4.4)
export type {
  RiskSafeguardMapping,
  MitigationEvaluation,
} from './mapping.types';

// Controles y zonas (metodología corporativa BPO CC v7.3)
export type {
  Zone,
  ControlTipo,
  ControlImplementacion,
  ControlGrado,
  ControlFrecuencia,
  AppliedControl,
} from './control.types';
