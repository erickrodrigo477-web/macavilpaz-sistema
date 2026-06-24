import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { Assignment } from '../entities/assignment.entity';
import { Maintenance } from '../entities/maintenance.entity';

@Injectable()
export class AiService implements OnModuleInit {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  async onModuleInit() {
    console.log('Motor Predictivo Heurístico Inicializado.');
  }

  /**
   * Calcula el riesgo de falla de forma determinista y lógica
   */
  calculateRisk(stats: {
    ageInDays: number,
    usageDays: number,
    intensity: number,
    correctiveCount: number,
    totalMaintenances: number
  }) {
    let riskScore = 0;

    // 1. Riesgo por Intensidad (Uso vs Edad)
    // Una intensidad > 0.6 (60% de los días en uso) aumenta el riesgo linealmente
    if (stats.intensity > 0.6) {
      riskScore += (stats.intensity - 0.6) * 50; // Hasta +20%
    }

    // 2. Riesgo por Historial de Fallas (Correctivos)
    // Cada falla correctiva en el último año es un indicador fuerte de degradación
    riskScore += stats.correctiveCount * 25; // 3 fallas = +75%

    // 3. Riesgo por Desgaste de Uso (Días totales de operación)
    // Asumimos que a los 300 días de operación neta, el riesgo base sube 30%
    riskScore += Math.min(30, (stats.usageDays / 300) * 30);

    // 4. Factor de Mitigación (Mantenimientos Totales)
    // Si ha tenido muchos mantenimientos pero pocos correctivos, el riesgo baja
    if (stats.totalMaintenances > 0 && stats.correctiveCount === 0) {
      riskScore -= 10;
    }

    // Normalizar probabilidad entre 0.05 y 0.98
    let probability = Math.max(0.05, Math.min(0.98, riskScore / 100));
    
    // Predicción binaria
    const prediction = probability > 0.65 ? 1 : 0;

    return { prediction, probability };
  }

  async predictForAsset(assetId: number) {
    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    if (!asset) throw new Error('Asset not found');

    const today = new Date();
    const purchaseDate = asset.fechaCompra ? new Date(asset.fechaCompra) : new Date('2022-01-01');
    const ageInDays = Math.max(1, Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Obtener todas las asignaciones para calcular días de uso
    const assignments = await this.assignmentRepository.find({ where: { activoId: assetId } });
    let usageDays = 0;
    assignments.forEach((a) => {
      const start = new Date(a.fechaAsignacion);
      const end = a.fechaDevolución ? new Date(a.fechaDevolución) : today;
      usageDays += Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    });

    // Análisis de historial de mantenimientos de los últimos 24 meses (para demo más rica)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const maintenances = await this.maintenanceRepository.find({
      where: { 
        activoId: assetId,
        fechaMantenimiento: MoreThan(twoYearsAgo)
      }
    });

    const correctiveCount = maintenances.filter(m => 
      m.tipoMantenimiento?.toLowerCase().includes('correctivo')
    ).length;
    
    const totalMaintenances = maintenances.length;
    const intensity = usageDays / ageInDays;

    const result = this.calculateRisk({
      ageInDays,
      usageDays,
      intensity,
      correctiveCount,
      totalMaintenances
    });

    return {
      assetId,
      assetName: asset.nombre,
      metrics: {
        ageInDays,
        usageDays,
        intensity: parseFloat(intensity.toFixed(2)),
        correctiveCount,
        totalMaintenances
      },
      prediction: result,
      status: result.prediction === 1 ? 'Riesgo de Fallo' : 'Operativo',
    };
  }
}
