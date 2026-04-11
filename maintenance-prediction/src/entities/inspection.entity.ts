import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('inspecciones_activos')
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'fecha_inspeccion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaInspeccion: Date;

  @Column({ name: 'nivel_vibracion', nullable: true })
  nivelVibracion: number;

  @Column({ name: 'nivel_ruido', nullable: true })
  nivelRuido: number;

  @Column({ name: 'nivel_calor', nullable: true })
  nivelCalor: number;

  @Column({ name: 'desgaste_visible', nullable: true })
  desgasteVisible: number;

  @Column({ nullable: true })
  comentarios: string;

  @Column({ name: 'falla_detectada', default: false })
  fallaDetectada: boolean;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'activo_id' })
  asset: Asset;
}
